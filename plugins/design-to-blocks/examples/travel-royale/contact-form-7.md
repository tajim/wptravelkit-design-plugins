# Travel Royale: Contact Form 7 forms

The Contact page uses two Contact Form 7 forms:

1. **Trip enquiry**: the main form in the "Tell us about your trip" section.
2. **Consultation request**: the "Book a free 30-minute consultation" card.

The Travel Royale stylesheet styles both forms through the `tr-cf7` wrapper that the page markup puts around each shortcode. You do not need any CSS in Contact Form 7.

## Setup

1. Go to **Contact → Add New**. Name the form `Trip enquiry`.
2. On the **Form** tab, delete everything and paste **Form 1** below.
3. On the **Mail** tab, set the Subject and Message body from the Form 1 mail section below. Leave To and From as they are, or set them to your own addresses.
4. Optional: on the **Messages** tab, change "Thank you for your message. It has been sent." to the text in the Messages section below.
5. Save. Copy the shortcode Contact Form 7 shows at the top.
6. Repeat steps 1 to 5 for **Form 2** with the name `Consultation request`.
7. On the Contact page, open the Code editor. Find the two placeholders and replace each one with its real shortcode:
   - `[contact-form-7 id="REPLACE-WITH-TRIP-ENQUIRY-FORM-ID" title="Trip enquiry"]`
   - `[contact-form-7 id="REPLACE-WITH-CONSULTATION-FORM-ID" title="Consultation request"]`

   You can also click each Shortcode block in the visual editor and paste the shortcode there.

Keep the markup exactly as it is, including the `<div class="…">` wrappers and the classes inside them. The pill, tile and grid layouts depend on them. You can still change labels, options and placeholder text.

---

## Form 1: Trip enquiry

### Form tab

```
<fieldset class="tr-cf7-fieldset">
<legend>1. About you</legend>
<div class="tr-cf7-grid tr-cf7-grid--2">
<div class="tr-field"><label for="tr-first">First name</label>[text* first-name id:tr-first autocomplete:given-name]</div>
<div class="tr-field"><label for="tr-last">Last name</label>[text* last-name id:tr-last autocomplete:family-name]</div>
<div class="tr-field"><label for="tr-email">Email</label>[email* your-email id:tr-email autocomplete:email]</div>
<div class="tr-field"><label for="tr-phone">Phone <span class="tr-opt">(optional)</span></label>[tel your-phone id:tr-phone autocomplete:tel]</div>
</div>
<div class="tr-field"><span class="tr-cf7-label">Best way to reach you</span><div class="tr-pills tr-pills--method">[radio contact-method use_label_element default:1 "Email" "Phone call" "WhatsApp" "Video call"]</div></div>
</fieldset>

<fieldset class="tr-cf7-fieldset">
<legend>2. Your trip</legend>
<div class="tr-field"><span class="tr-cf7-label">Where are you dreaming of? <span class="tr-opt">Choose any</span></span><div class="tr-pills tr-pills--check">[checkbox destinations use_label_element "Canadian Rockies" "Alaska" "California" "Pacific Northwest" "New York City" "New England" "Hawaii" "Québec & Maritimes" "National parks" "Not sure yet"]</div></div>
<div class="tr-cf7-grid tr-cf7-grid--4">
<div class="tr-field"><label for="tr-when">When</label>[text travel-when id:tr-when placeholder "e.g. Sept 2027"]</div>
<div class="tr-field"><label for="tr-length">Trip length</label>[select trip-length id:tr-length "Not sure yet" "Under 7 nights" "7–10 nights" "11–14 nights" "15+ nights"]</div>
<div class="tr-field"><label for="tr-adults">Adults</label>[number adults id:tr-adults min:1 max:30 "2"]</div>
<div class="tr-field"><label for="tr-kids">Children</label>[number children id:tr-kids min:0 max:30 "0"]</div>
</div>
<div class="tr-field"><span class="tr-cf7-label">Budget per person, excluding international flights</span><div class="tr-pills tr-pills--tiles">[radio budget use_label_element default:2 "Under $10k" "$10–20k" "$20–40k" "$40k+"]</div></div>
<div class="tr-cf7-grid tr-cf7-grid--2">
<div class="tr-field"><label for="tr-occasion">Special occasion?</label>[select occasion id:tr-occasion "None" "Honeymoon" "Anniversary" "Birthday" "Proposal" "Family reunion"]</div>
<div class="tr-field"><label for="tr-heard">How did you hear about us?</label>[select heard-about id:tr-heard first_as_label "Please choose" "Friend or family" "Returning client" "Search engine" "Social media" "Press or magazine"]</div>
</div>
<div class="tr-field"><label for="tr-msg">Anything else we should know?</label>[textarea trip-notes id:tr-msg x5 placeholder "Must-sees, hotels you've loved, pace, dietary needs, mobility…"]</div>
</fieldset>

<div class="tr-cf7-footer">
<div class="tr-cf7-consent">[acceptance newsletter optional] Send me seasonal travel ideas, once a month. We never share your details. See our <a href="/privacy-policy/">privacy policy</a>. [/acceptance]</div>
[submit class:tr-cf7-submit class:tr-cf7-submit--send "Send my enquiry"]
</div>
```

### Mail tab

**Subject**

```
New trip enquiry from [first-name] [last-name]
```

**Additional headers**

```
Reply-To: [your-email]
```

**Message body**

```
Name: [first-name] [last-name]
Email: [your-email]
Phone: [your-phone]
Best way to reach: [contact-method]

Destinations: [destinations]
When: [travel-when]
Trip length: [trip-length]
Adults: [adults]
Children: [children]
Budget per person: [budget]
Special occasion: [occasion]
Heard about us: [heard-about]

Notes:
[trip-notes]

Seasonal travel ideas: [newsletter]

--
Sent from the trip enquiry form on [_site_title] ([_site_url])
```

---

## Form 2: Consultation request

### Form tab

```
<div class="tr-cf7-head"><span class="tr-cf7-head__title">Choose a day and time</span><span class="tr-cf7-head__note">Eastern Time (ET)</span></div>
<div class="tr-cf7-grid tr-cf7-grid--2">
<div class="tr-field"><label for="tr-c-date">Preferred date</label>[date* call-date id:tr-c-date]</div>
<div class="tr-field"><span class="tr-cf7-label">Call type</span><div class="tr-pills tr-pills--method tr-pills--call">[radio call-type use_label_element default:1 "Phone call" "Video call"]</div></div>
</div>
<div class="tr-field"><span class="tr-cf7-label">Preferred time</span><div class="tr-pills tr-pills--tiles tr-pills--slots">[radio call-time use_label_element default:3 "9:00 am" "10:00 am" "11:00 am" "1:00 pm" "2:30 pm" "4:00 pm" "5:30 pm" "7:00 pm"]</div></div>
<div class="tr-cf7-grid tr-cf7-grid--2">
<div class="tr-field"><label for="tr-c-name">Your name</label>[text* call-name id:tr-c-name autocomplete:name]</div>
<div class="tr-field"><label for="tr-c-email">Email</label>[email* call-email id:tr-c-email autocomplete:email]</div>
</div>
<div class="tr-cf7-footer">
<span class="tr-cf7-note">30 minutes · We confirm by email within one business day</span>
[submit class:tr-cf7-submit class:tr-cf7-submit--arrow "Confirm time"]
</div>
```

### Mail tab

**Subject**

```
Consultation request: [call-date] at [call-time] ET
```

**Additional headers**

```
Reply-To: [call-email]
```

**Message body**

```
Name: [call-name]
Email: [call-email]
Preferred date: [call-date]
Preferred time: [call-time] ET
Call type: [call-type]

--
Sent from the consultation form on [_site_title] ([_site_url])
```

---

## Messages (optional)

These replace the thank-you states from the design.

- **Trip enquiry**, "Sender's message was sent successfully":
  `Thank you, your enquiry is with us. A travel designer who specializes in your destination will be in touch within one business day.`
- **Consultation request**, "Sender's message was sent successfully":
  `Thank you. Your call request is in, and we will confirm the time by email within one business day.`

## What changed from the design

- **Booking calendar:** the design's six fixed date buttons became a date picker. Hard-coded dates would go out of date, and Contact Form 7 has no live calendar. The time slots and call type are still pill buttons.
- **Consultation form:** I added name and email fields so each request reaches you with contact details.
- **Thank-you screens:** the design's thank-you panels are replaced by Contact Form 7's normal success message. Its text is set on the Messages tab.
