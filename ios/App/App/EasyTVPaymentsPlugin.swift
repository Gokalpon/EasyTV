import Foundation
import StoreKit
import Capacitor

@objc(EasyTVPaymentsPlugin)
public class EasyTVPaymentsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "EasyTVPaymentsPlugin"
    public let jsName = "EasyTVPayments"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSubscriptionStatus", returnType: CAPPluginReturnPromise)
    ]

    private let defaultProductIds = ["easytv.premium.monthly", "easytv.premium.yearly"]
    private var cachedProducts: [String: Product] = [:]

    @objc func getProducts(_ call: CAPPluginCall) {
        Task {
            do {
                let ids = requestedProductIds(from: call)
                let products = try await fetchProducts(for: ids)
                let payload = products.map(productPayload)
                call.resolve(["products": payload])
            } catch {
                call.resolve(["products": []])
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task {
            guard let productId = call.getString("productId"), !productId.isEmpty else {
                call.resolve(failResult(code: "missing_product_id", message: "productId is required."))
                return
            }

            do {
                let products = try await fetchProducts(for: [productId])
                guard let product = products.first else {
                    call.resolve(failResult(code: "product_not_found", message: "Product not found."))
                    return
                }

                let purchaseResult = try await product.purchase()
                switch purchaseResult {
                case .success(let verification):
                    guard case .verified(let transaction) = verification else {
                        call.resolve(failResult(code: "verification_failed", message: "Transaction verification failed."))
                        return
                    }

                    let expiresAt = isoDate(transaction.expirationDate)
                    await transaction.finish()
                    call.resolve([
                        "ok": true,
                        "source": "iap",
                        "productId": transaction.productID,
                        "expiresAt": expiresAt as Any
                    ])
                case .userCancelled:
                    call.resolve(failResult(code: "user_cancelled", message: "Purchase cancelled by user."))
                case .pending:
                    call.resolve(failResult(code: "purchase_pending", message: "Purchase is pending."))
                @unknown default:
                    call.resolve(failResult(code: "purchase_unknown", message: "Unknown purchase result."))
                }
            } catch {
                call.resolve(failResult(code: "purchase_error", message: error.localizedDescription))
            }
        }
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                let status = await resolveStatus()
                if status.active {
                    call.resolve([
                        "ok": true,
                        "source": "iap",
                        "productId": status.productId as Any,
                        "expiresAt": status.expiresAt as Any
                    ])
                } else {
                    call.resolve(failResult(code: "no_purchase", message: "No active purchases found."))
                }
            } catch {
                call.resolve(failResult(code: "restore_error", message: error.localizedDescription))
            }
        }
    }

    @objc func getSubscriptionStatus(_ call: CAPPluginCall) {
        Task {
            let status = await resolveStatus()
            call.resolve([
                "active": status.active,
                "source": "iap",
                "productId": status.productId as Any,
                "expiresAt": status.expiresAt as Any
            ])
        }
    }

    private func requestedProductIds(from call: CAPPluginCall) -> [String] {
        if let ids = call.options["productIds"] as? [String] {
            let clean = ids.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
            if !clean.isEmpty { return clean }
        }
        return defaultProductIds
    }

    private func fetchProducts(for ids: [String]) async throws -> [Product] {
        let products = try await Product.products(for: ids)
        for product in products {
            cachedProducts[product.id] = product
        }

        let sortMap = Dictionary(uniqueKeysWithValues: ids.enumerated().map { ($0.element, $0.offset) })
        return products.sorted {
            let lhs = sortMap[$0.id] ?? Int.max
            let rhs = sortMap[$1.id] ?? Int.max
            return lhs < rhs
        }
    }

    private func productPayload(_ product: Product) -> [String: Any] {
        return [
            "id": product.id,
            "title": product.displayName,
            "price": product.displayPrice,
            "period": periodString(for: product)
        ]
    }

    private func periodString(for product: Product) -> String {
        guard let period = product.subscription?.subscriptionPeriod else {
            return "unknown"
        }
        switch period.unit {
        case .day:
            return period.value == 7 ? "weekly" : "daily"
        case .week:
            return "weekly"
        case .month:
            return period.value >= 12 ? "yearly" : "monthly"
        case .year:
            return "yearly"
        @unknown default:
            return "unknown"
        }
    }

    private func resolveStatus() async -> (active: Bool, productId: String?, expiresAt: String?) {
        let allowed = Set(defaultProductIds)
        var activeTransactions: [(productId: String, expiresAt: Date?)] = []
        let now = Date()

        for await entitlement in Transaction.currentEntitlements {
            guard case .verified(let transaction) = entitlement else { continue }
            guard allowed.contains(transaction.productID) else { continue }
            guard transaction.revocationDate == nil else { continue }
            if let expiration = transaction.expirationDate, expiration <= now { continue }
            activeTransactions.append((transaction.productID, transaction.expirationDate))
        }

        guard !activeTransactions.isEmpty else {
            return (false, nil, nil)
        }

        let best = activeTransactions.max { lhs, rhs in
            let lhsDate = lhs.expiresAt ?? Date.distantFuture
            let rhsDate = rhs.expiresAt ?? Date.distantFuture
            return lhsDate < rhsDate
        }

        return (true, best?.productId, isoDate(best?.expiresAt))
    }

    private func isoDate(_ date: Date?) -> String? {
        guard let date else { return nil }
        return ISO8601DateFormatter().string(from: date)
    }

    private func failResult(code: String, message: String) -> [String: Any] {
        return [
            "ok": false,
            "source": "iap",
            "code": code,
            "message": message
        ]
    }
}
