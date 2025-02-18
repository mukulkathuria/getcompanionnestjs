import { emailTemplateDto } from './templates.dto';

export default function (params: emailTemplateDto) {
  return {
    welcome: {
      subject: 'You’ve Just Unlocked an Exclusive World! ✨',
      body: `
        <p>Dear ${params.username}</p>,
        <div>
        <p>Welcome to the Zestful Amigos family! You’re not just a user; you’re now part of a select community that knows how to truly enjoy life. 🌟
        Our companions are here to ensure that every moment you spend with us is extraordinary. From vibrant city strolls to deep conversations, we’re here to turn ordinary days into unforgettable memories.
        Dive in, explore, and let’s make magic happen! ✨</p>
        </div>
        <br/>
        <div>
        With excitement,
        <br/>  
        Zestful Amigos Team
        </div>
        `,
    },
    bookingconfirmation: {
      subject: 'Your Zestful Encounter is Officially Locked In! 🥂',
      body: `
       <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    background-color: #f9f9f9;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.5;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    text-align: center;
                    color: #777;
                }
                .signature {
                    font-weight: bold;
                    color: #333;
                }
                .details {
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #f1f1f1;
                    border-radius: 6px;
                }
                .details p {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Booking Confirmation</h2>
                </div>
                <div class="content">
                    <p>Hello ${params.username},</p>
                    <p>You’ve made a fantastic choice! Your rendezvous with ${params.companion_name} is confirmed, and we’re thrilled to curate a memorable experience for you. 💫</p>

                    <div class="details">
                        <p><strong>Details:</strong></p>
                        <p><strong>Companion:</strong> ${params.companion_name}</p>
                        <p><strong>Date & Time:</strong> ${params.date_time}</p>
                        <p><strong>Meeting Spot:</strong> ${params.meetingpoint}</p>
                    </div>

                    <p>Prepare for an experience that will linger in your thoughts long after it ends. We’re here to elevate your moments!</p>
                </div>
                <div class="footer">
                    <p class="signature">With anticipation, <br> Zestful Amigos Team</p>
                </div>
            </div>
        </body>
        </html>
        `,
    },
    feedbackrequest: {
      subject: 'How Was Your Exquisite Experience? We’re All Ears! 🎤',
      body: `
       <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Feedback Request</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    background-color: #f9f9f9;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.5;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    text-align: center;
                    color: #777;
                }
                .signature {
                    font-weight: bold;
                    color: #333;
                }
                .link {
                    color: #1a73e8;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>We Value Your Feedback</h2>
                </div>
                <div class="content">
                    <p>Hi ${params.username},</p>
                    <p>Your satisfaction is our pride, and we’d love to hear about your experience with ${params.companion_name}. 💬</p>
                    <p>Your words help us perfect every moment, ensuring your next rendezvous is even more delightful. Share your feedback <a href="[insert-feedback-link]" class="link">here</a>—your thoughts are as valuable as gold to us.</p>
                </div>
                <div class="footer">
                    <p class="signature">With gratitude, <br> Zestful Amigos Team</p>
                </div>
            </div>
        </body>
        </html>
        `,
    },
    usercancelbooking: {
      subject: 'Your Cancellation is Complete, But We’ll Miss You! 💔',
      body: `
       <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Cancellation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    background-color: #f9f9f9;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.5;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    text-align: center;
                    color: #777;
                }
                .signature {
                    font-weight: bold;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Booking Cancellation</h2>
                </div>
                <div class="content">
                    <p>Dear ${params.username},</p>
                    <p>We’re sorry to see your plans change. Your booking with ${params.companion_name} has been canceled as requested. If life brings you back our way, we’d love nothing more than to make it up to you with an even better experience.</p>
                    <p>Should you wish to reconnect, our doors are always open!</p>
                </div>
                <div class="footer">
                    <p class="signature">Warmly, <br> Zestful Amigos Team</p>
                </div>
            </div>
        </body>
        </html>
        `,
    },
    refundprocess: {
      subject: 'Your Refund is Being Wrapped Up With Care 🎁',
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Refund Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    background-color: #f9f9f9;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .content {
                    font-size: 16px;
                    line-height: 1.5;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    text-align: center;
                    color: #777;
                }
                .signature {
                    font-weight: bold;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <p>Hi <b>${params.username}</b>,</p>
                    <p>We understand how precious your trust is, and we’ve expedited your refund of ₹${params.refundamount}. It will reach you within the next 3-5 business days.</p>

                    <p>Thank you for your patience and understanding. We hope to welcome you back soon for a spectacular experience that exceeds your expectations.</p>
                    
                    <br />
                    <p>With appreciation,</p>
                    <br />
                    <p class="signature">Zestful Amigos Team</p>
                </div>
            </div>
        </body>
        </html>
        `,
    },
  };
}

/*

 6. Companion Recruitment Email
Subject: Step Into the World of Elegance—Join Zestful Amigos 🌐

Dear [Applicant’s Name],

We were impressed by your charm and energy! At Zestful Amigos, we pride ourselves on curating experiences filled with warmth, class, and unforgettable moments. If you’re ready to be a part of something truly special, fill out this form [link].

Let’s create magic together!

With high hopes,  
Zestful Amigos Recruitment Team

 7. Security Alert Email
Subject: Action Required: Your Account’s Security is Our Priority 🔒

Dear [User's Name],

We’ve noticed unusual activity in your Zestful Amigos account. For your safety, we’ve temporarily secured it. Please reset your password [here] to regain access.

We’re committed to ensuring your experiences are always worry-free.

Safeguarding you,  
Zestful Amigos Security Team


 8. Special Offers & Discounts Email
Subject: Unlock a World of Privileges—Just for You! 🎁

Hi [User's Name],

We’ve reserved something special just for you! For a limited time, enjoy 25% off your next experience with the code *ZESTFUL25*. 

Don’t let this exclusive offer slip away—book now and indulge in moments crafted just for you!

Cheers to more unforgettable moments,  
Zestful Amigos Team

9. Companion Assignment Email (For Companions)
Subject: Your Presence is Requested for a New Assignment 🌟

Dear [Companion’s Name],

We’re thrilled to inform you of a new opportunity to shine.  
Client Name:[Client’s Name]  
Date & Time:  [Date & Time]  
Location:  [Meeting Spot]

We trust you’ll create an experience that our clients will cherish. Let’s keep setting the bar higher!

With admiration,  
Zestful Amigos Operations Team

10. Inactive User Re-engagement Email
Subject: We’ve Missed You—Come Rediscover Zestful Magic! 💛

Hi [User's Name],

It’s been a while since your last experience, and we’ve been eagerly awaiting your return. Our companions are ready to transform your moments into memories you’ll cherish.

Use code *COMEBACK15* for an exclusive 15% off on your next booking. Let’s create something beautiful together again!

With open arms,  
Zestful Amigos Team


11. Account Verification Email
Subject: Welcome, [User's Name]! Let’s Secure Your Journey with Zestful Amigos 🔐

Hi [User's Name],

Before you dive into our world of captivating experiences, please verify your email to secure your account.  
Click here to confirm your email: [Verification Link]

Your exclusive adventures await! ✨

With excitement,  
Zestful Amigos Team

 12. Birthday Greeting Email
Subject: Happy Birthday, [User's Name]! Here’s a Special Gift Just for You 🎂🎁

Dear [User's Name],

It’s your special day, and we couldn’t be more thrilled to celebrate it with you! As a token of our appreciation, enjoy *30% off* your next booking with code *BIRTHDAY30*.

We hope this year is filled with unforgettable moments—let’s create a few together!

Wishing you joy,  
Zestful Amigos Team

 13. Anniversary Email (One Year Since Joining)
Subject: A Year with Zestful Amigos—Thank You for the Memories! 🌹

Hi [User's Name],

It’s been a year since you joined our exclusive circle, and we couldn’t be more grateful for your presence! 🎉 To celebrate, we’re gifting you *40% off* on your next booking with code *YEARONE*.

Here’s to more delightful experiences together! 🥂

With heartfelt appreciation,  
Zestful Amigos Team

14. Companion Appreciation Email (For Companions)
Subject: You Are the Heart of Zestful Amigos 🌟

Dear [Companion’s Name],

We wanted to take a moment to appreciate your dedication, grace, and the incredible experiences you create. Your presence is a gift to our clients, and we’re proud to have you on our team.

As a token of our gratitude, enjoy a special bonus this month. Keep shining! ✨

With admiration,  
Zestful Amigos Management Team

15. Membership Upgrade Email
Subject:* Elevate Your Experience with Zestful Amigos Elite Membership 🚀

Hi [User's Name],

You deserve nothing but the finest. That’s why we’re offering you an upgrade to our *Elite Membership*, where exclusivity meets unparalleled service. Enjoy priority bookings, exclusive offers, and personalized companion recommendations.

Unlock the next level of experiences [here].

To your exquisite moments,  
Zestful Amigos Team

 16. Account Reactivation Email
Subject: We Missed You! Reactivate Your Account for Exclusive Perks ✨

Dear [User's Name],

We noticed that your account has been inactive for a while, and we’d love to have you back. Reactivate now and enjoy a *complimentary booking upgrade* on your next experience.

Let’s reconnect and make your days extraordinary again!

Yours truly,  
Zestful Amigos Team

17. Seasonal Greetings Email
Subject: Warm Wishes from Zestful Amigos This Holiday Season! 🎄🎁

Dear [User's Name],

The holidays are a time for joy, celebration, and cherished moments. We’re grateful to have you in our community, and we can’t wait to make your festive season even brighter with our special companions.

Use code *HOLIDAY20* for an exclusive discount on your next booking!

With festive cheer,  
Zestful Amigos Team

18. Client Appreciation Email (For High-Value Customers)
Subject: You’re One of Our Most Treasured Amigos 🌟

Dear [User's Name],

We truly value your continued trust in Zestful Amigos. As one of our most cherished clients, we’re excited to offer you a *complimentary VIP experience* on your next booking. 🎁

This is our way of saying thank you for choosing us time and again.

With deepest gratitude,  
Zestful Amigos Team

 19. Pre-Event Reminder Email
Subject: Your Special Rendezvous Awaits Tomorrow! 🌆

Hi [User's Name],

Just a friendly reminder that your exclusive booking with [Companion’s Name] is happening tomorrow at [Time] at [Location]. ✨

We’re sure it’s going to be an experience to remember. Don’t hesitate to reach out if you need anything before then!

Anticipating your great time,  
Zestful Amigos Team

 20. Post-Event Thank You Email
Subject: Thank You for Choosing Zestful Amigos—We Hope You Loved It! 💕

Dear [User's Name],

We hope your experience with [Companion’s Name] was nothing short of delightful. It was our absolute pleasure to serve you, and we look forward to crafting many more unforgettable moments together.

As a token of appreciation, here’s a *10% discount* for your next booking: *THANKYOU10*.

With heartfelt thanks,  
Zestful Amigos Team

*/
