import { emailTemplateDto } from './templates.dto';

export default function (params: emailTemplateDto) {
  return {
    bookingconfirmation: `Your booking with ${params.username} is confirmed! See you on ${params.date_time}. 🎉`,
    bookingreminder: `Just a reminder – your booking with ${params.companion_name} is coming up soon! Don’t be late! ⏰`,
    transactionsucess: `Payment successful! You’re all set for a fantastic time with ${params.companion_name}. 💸✨`,
    transactionfailure: `Oops! Your payment didn’t go through. Please try again to confirm your booking. 🚫💳`,
    bookingpending: `Your booking is pending . We’ll update you soon! 🕒`,
    cancelationbyuser: `Your booking with ${params.companion_name} has been cancelled. Hope to see you back soon! 👋`,
    cancellationbyadmin: `We’re sorry, your booking with ${params.companion_name} has been cancelled. Check your inbox for details. ❌`,
    cancelationrequestbycompanion: `Your cancellation request for ${params.username} and time ${params.date_time} is under consideration. Admin will contact you soon.`,
    welcomeuser: `Welcome to Zestful Amigos! Let’s get you set up for an unforgettable experience`,
    profileupdate: `Profile updated successfully! Your details are now up-to-date. ✏️✅`,
    getrating: `How was your experience with ${params.companion_name}? Rate your time with us! ⭐️`,
  };
}

/* 
1. Booking Confirmation
Your booking with [Companion’s Name] is confirmed! See you on [Date & Time]. 🎉

2. Booking Reminder
"Just a reminder – your booking with [Companion’s Name] is coming up soon! Don’t be late! ⏰"

3. Transaction Success
"Payment successful! You’re all set for a fantastic time with [Companion’s Name]. 💸✨"

4. Transaction Failure
"Oops! Your payment didn’t go through. Please try again to confirm your booking. 🚫💳"

5. Booking Pending
"Your booking is pending . We’ll update you soon! 🕒"

6. Booking Cancelled by User
"Your booking with [Companion’s Name] has been cancelled. Hope to see you back soon! 👋"

7. Booking Cancelled by Admin
"We’re sorry, your booking with [Companion’s Name] has been cancelled. Check your inbox for details. ❌"

8. Companion Unavailable
"[Companion’s Name] is unavailable. Choose another companion to keep your plans on track! 🔄"

9. New Companion Suggestion
"[Companion’s Name] would be perfect for your next booking. Check out their profile! 🌟"

10. Special Offer or Discount *2ND PHASE*
"Enjoy a little extra on us! Use code [DISCOUNT_CODE] for [Discount%] off your next booking. 🎁"


11. Booking Rescheduled by Admin/Companion
"Your booking has been rescheduled! Check the new details in your account. 🔄📅"

12. Companion Request Awaiting Approval
"Your request to book [Companion’s Name] is awaiting approval. We’ll keep you posted! 🚦"

13. Booking Successfully Modified by User
"Your booking details have been updated! Review the changes in your account. 🔧"

14. Profile Update Confirmation
"Profile updated successfully! Your details are now up-to-date. ✏️✅"

15. Booking Feedback Request
"How was your experience with [Companion’s Name]? Rate your time with us! ⭐️"

16. Referral Reward
"Your friend joined Zestful Amigos! Enjoy your reward, and keep spreading the love. 🎉🙌"

17. Welcome Notification for New Users
"Welcome to Zestful Amigos! Let’s get you set up for an unforgettable experience.

*/
