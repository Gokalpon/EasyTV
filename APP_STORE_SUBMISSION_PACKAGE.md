# EasyTV App Store Submission Package

Bu paket, App Store Connect'e girilecek metinleri ve privacy cevaplarini tek yerde toplar.

## 1. App Information

App Name:
EasyTV Hub

Subtitle:
Subscriptions, costs, and renewal reminders

Category:
Productivity

Secondary Category:
Utilities

Content Rights:
No, it does not contain, show, or access third-party copyrighted media content. The app only stores user-entered subscription metadata and service names/logos for organization.

Age Rating:
4+

## 2. Promotional Text

Track your streaming subscriptions, renewal dates, account notes, and shared costs in one secure place.


## 3. Description

EasyTV Hub helps you organize your streaming and digital subscriptions in one clean, mobile-first app.

Add services such as Netflix, Spotify, YouTube Premium, Disney+, Prime Video, and more. Track renewal dates, monthly costs, account notes, plan details, and shared subscription splits without jumping between apps.

Key features:

- Manage all subscriptions in one place
- Track monthly spending and renewal dates
- Calculate shared subscription costs per person
- Protect app access with PIN and device authentication
- Export and restore your data
- Sync account data securely when signed in
- Unlock unlimited subscription tracking with EasyTV Premium

EasyTV Hub does not show ads and does not sell personal data. Premium subscriptions are handled through Apple In-App Purchase.


## 4. Keywords

subscription,streaming,manager,renewal,budget,netflix,spotify,youtube,expense,tracker


## 5. Support URLs

Privacy Policy URL:
https://easytvhub.app/privacy.html

Support URL:
https://easytvhub.app

Marketing URL:
https://easytvhub.app

Note:
If the public website is not live yet, publish `privacy.html` and a simple support page before App Store submission.


## 6. App Privacy Answers

Data Collection:
Yes, this app collects data.

Tracking:
No, this app does not use data for tracking.

Data Used to Track You:
None.

Third-Party Advertising:
No.

Developer Advertising or Marketing:
No.

Analytics:
No dedicated analytics SDK was found in the current codebase.

Data Linked to the User:
Yes. Email address, user ID, subscription/user content, and purchase status are linked to the signed-in user for app functionality.

Data Not Linked to the User:
Exchange-rate lookup and AI price lookup may use country/service context, but current code does not send signed-in user identity for those requests.


## 7. App Privacy Data Types

### Contact Info

Data Type:
Email Address

Collected:
Yes

Linked to User:
Yes

Used for Tracking:
No

Purpose:
App Functionality

Reason:
Used for account authentication through Supabase, Google sign-in, or Apple sign-in.


### Identifiers

Data Type:
User ID

Collected:
Yes

Linked to User:
Yes

Used for Tracking:
No

Purpose:
App Functionality

Reason:
Used to store and sync each user's own `easytv_user_data` records.


### User Content

Data Type:
Other User Content

Collected:
Yes

Linked to User:
Yes

Used for Tracking:
No

Purpose:
App Functionality

Reason:
The app stores user-entered subscription records, settings, profile data, service notes, renewal dates, and encrypted credential fields for the user's own subscription manager.


### Purchases

Data Type:
Purchase History

Collected:
Yes

Linked to User:
Yes

Used for Tracking:
No

Purpose:
App Functionality

Reason:
The app stores premium status, product ID, transaction ID, original transaction ID, and expiry date to unlock Premium features and restore purchases.

Note:
Apple processes payment details. EasyTV receives purchase entitlement metadata only.


## 8. Data Types Not Collected

Do not select these unless the app changes:

- Location
- Contacts
- Photos or Videos
- Audio Data
- Camera access
- Health and Fitness
- Browsing History
- Search History
- Advertising Data
- Crash Data
- Performance Data
- Other Diagnostic Data
- Device ID for tracking

Note:
The app has a global error handler, but no external crash reporting SDK was found in the current codebase.


## 9. Privacy Nutrition Label Summary

Data Linked to You:

- Email Address
- User ID
- Other User Content
- Purchase History

Data Not Linked to You:

- None required for current primary app functionality.

Data Used to Track You:

- None.


## 10. Review Notes

EasyTV Hub is a subscription manager for streaming and digital services. Users can add their own subscription records, track renewal dates, calculate monthly costs, and protect access with PIN/device authentication.

Premium features are unlocked through Apple In-App Purchase using these product IDs:

- `easytv.premium.monthly`
- `easytv.premium.yearly`

Restore purchases is available inside the Premium screen.

Account deletion is available in the app from Settings > Account > Delete Account. This calls the server-side delete-account function, removes the user's cloud app data and Supabase Auth user, clears local app data, then signs the user out.

OAuth login uses the custom callback URL:

- `easytvhub://auth/callback`

If review needs a demo login, create a temporary Supabase test user before submission and place the credentials in App Review Notes.


## 11. Demo Account Placeholder

Use this only after creating the account in production Supabase:

Email:
review@easytvhub.app

Password:
Create a strong temporary password and rotate it after review.


## 12. Subscription Review Notes

Subscription Name:
EasyTV Premium

Monthly Product ID:
`easytv.premium.monthly`

Yearly Product ID:
`easytv.premium.yearly`

Premium Benefits:

- Unlimited subscription entries
- Shared cost calculation
- Advanced spending summary
- Renewal reminders

Restore:
The Premium screen includes a "Restore Purchases" action.


## 13. Risk Notes Before Submission

Review risk:
The code contains an AI price update request to `https://api.anthropic.com/v1/messages`. It sends service names and selected country/currency context, not account identity. If this feature is enabled in production, consider mentioning it in the privacy policy as a third-party service or disabling it before submission.

Review risk:
The privacy policy currently references the public website `https://easytvhub.app`. Make sure this URL is live before submission.

Review risk:
The server-side delete-account endpoint is implemented, but it must be deployed with `SUPABASE_SERVICE_ROLE_KEY` set as an Edge Function secret before App Store review.


## 14. Evidence From Current Repo

Privacy manifest:
[PrivacyInfo.xcprivacy](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App/PrivacyInfo.xcprivacy)

Supabase auth and cloud sync:
[app.js](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/app.js)

Payment bridge:
[payment-service.js](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/payment-service.js)

Native StoreKit bridge:
[EasyTVPaymentsPlugin.swift](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/ios/App/App/EasyTVPaymentsPlugin.swift)

Server-side Apple transaction verification:
[verify-ios-subscription/index.ts](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase/functions/verify-ios-subscription/index.ts)

Server-side account deletion:
[delete-account/index.ts](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/supabase/functions/delete-account/index.ts)

Privacy policy:
[privacy.html](/C:/Users/user/Desktop/Apps/EasyTV/EasyTV/privacy.html)


## 15. Apple References

- App Privacy Reference: https://developer.apple.com/help/app-store-connect/reference/app-privacy
- Manage App Privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- User Privacy and Data Use: https://developer.apple.com/app-store/user-privacy-and-data-use/
