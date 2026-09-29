# El Modena Basketball Schedule

Responsive schedule application for the El Modena Vanguard Boys
Basketball website.

The application is hosted with GitHub Pages and embedded into the main
ELMO Hoops Wix website. Schedule data is retrieved from Google Calendar
using the Google Calendar API.

## Live Sites

Main website:

https://www.elmohoops.org/

Schedule application:

https://elmohoops.github.io/schedule/

The GitHub Pages application is intended primarily to be displayed
inside the Wix website rather than used as a standalone website.

## Architecture

The ELMO Hoops website uses three services:

### Wix

Wix hosts the main public website:

https://www.elmohoops.org/

Wix controls the site navigation, page layout, registration links,
sponsor information, contact information, and other normal website
content.

Several dynamic portions of the website are embedded as GitHub Pages
applications using Wix HTML/iframe elements.

### GitHub

GitHub hosts the custom web applications used by the website.

Organization:

https://github.com/elmohoops

Repositories:

-   `schedule` - Game and event schedule
-   `rosters` - Team rosters and coaching staffs
-   `boosters` - Booster Board directory
-   `sponsors` - Sponsor directory/carousel

Each application is hosted using GitHub Pages.

### Google

Google provides the data used by the GitHub applications.

The Schedule application reads from Google Calendar.

The Rosters and Booster Board applications read from Google Sheets.

This separation allows routine website updates to be made by editing
Google Calendar or Google Sheets without modifying application code.

## Schedule Data

Schedule information is maintained in Google Calendar.

The application supports separate calendars for the El Modena basketball
teams and combines their events into one chronological schedule.

Current enabled calendar configuration includes:

-   Varsity
-   JV
-   Frosh/Soph
-   Team Events

A separate Freshman calendar remains configured in `js/config.js` but is
currently disabled.

Team calendars can be enabled or disabled in `js/config.js`.

Calendar events can contain information such as:

-   Date and time
-   Opponent/event name
-   Location
-   Description

Locations are displayed as links to Google Maps when available.

## Google Calendar API

The application uses the Google Calendar API v3.

The API key is configured in:

`js/config.js`

The Google Cloud API key uses HTTP referrer restrictions.

The production GitHub Pages domain must therefore be included in the API
key's allowed website referrers:

`https://elmohoops.github.io/*`

If the application remains stuck on "Loading...", check the browser
developer console/network tab for Google Calendar API errors. A
`403 Forbidden` response often indicates that the current website URL is
not included in the API key's allowed HTTP referrers.

Do not remove API restrictions simply to resolve an API error.

## Repository Structure

``` text
schedule/
├── assets/
├── css/
├── dev/
├── js/
│   ├── app.js
│   ├── calendar.js
│   ├── config.js
│   ├── model.js
│   ├── renderer.js
│   └── utils.js
├── index.html
└── README.md
```

### Production

The repository root contains the production version of the application.

GitHub Pages publishes from:

`main / (root)`

Production URL:

https://elmohoops.github.io/schedule/

### Development

The `dev/` directory is used to develop and test changes before
promoting them to production.

Changes should normally be tested in DEV before the corresponding files
are copied/promoted to the repository root.

Avoid making experimental changes directly to the production files.

## Application Flow

`index.html` loads the application and starts `js/app.js`.

`app.js` loads the configuration and retrieves events for each enabled
calendar.

The JavaScript modules separate responsibilities:

-   `config.js` - Calendar configuration, API key, team settings,
    pagination
-   `calendar.js` - Google Calendar API communication
-   `model.js` - Internal schedule/game data structures
-   `renderer.js` - HTML generation and user interface
-   `utils.js` - Shared utility functions
-   `app.js` - Application startup and coordination

## Schedule Features

The application currently supports:

-   Multiple Google Calendars
-   Combined chronological schedule
-   Team identification
-   Day grouping
-   Team filtering
-   Event descriptions
-   Clickable locations
-   Adaptive desktop pagination using three visual rows
-   Multiple date groups sharing a desktop row when space permits
-   Equal-height date-group containers within each desktop row
-   Previous/Next navigation
-   First/Last navigation
-   Touch-friendly delegated pagination controls
-   Calendar subscription links
-   Responsive desktop/mobile layout
-   Wix iframe embedding

## Responsive Schedule Layout

The desktop and mobile schedule layouts intentionally behave differently.

### Desktop

The schedule is paginated into three visual rows per page. Date groups
are packed into those rows based on the number of event cards they
contain.

Several dates containing one event each may share a row, while a date
containing several events may occupy more of the available row width.
This keeps sparse portions of the schedule compact while still keeping
all events for a date together.

Date groups within the same visual row stretch to the height of the
tallest date group in that row. The event cards themselves keep their
natural content-driven height. This allows optional event text to expand
a card without creating a jagged row of date-group backgrounds.

The desktop date-group area and Subscribe section are centered within the
application so the layout remains balanced when a row is not completely
filled.

### Mobile

The mobile layout uses a single-column chronological schedule. Each date
is followed by all events scheduled for that date.

Do not apply the desktop date-group card layout to mobile. The mobile
presentation is intentionally simpler and should be tested directly on
a mobile device rather than relying only on Wix's mobile preview.

Pagination controls use delegated pointer events so dynamically rendered
Previous/Next and First/Last buttons continue to respond to a single tap
after repeated page changes.

## Making Routine Schedule Changes

Most schedule changes DO NOT require changes to GitHub.

To add, remove, or edit games and events, update the appropriate Google
Calendar.

The website retrieves the updated Calendar data automatically.

GitHub should normally only be changed when modifying the appearance,
behavior, configuration, or functionality of the schedule application.

## Deploying Code Changes

Recommended workflow:

1.  Make the change in the development version.
2.  Test the DEV version directly in a desktop browser and in Wix if
    appropriate.
3.  Test mobile behavior directly on a phone. Wix mobile preview may not
    reproduce touch behavior accurately.
4.  Verify pagination, date grouping, and responsive behavior before
    promotion.
5.  Promote the tested files to the production/root version.
6.  Commit the production changes to `main`.
7.  GitHub Pages automatically redeploys the site.
8.  Verify the production GitHub Pages URL.
9.  Verify the embedded schedule on ELMOHoops.org.

For significant stable releases, create a Git tag/release.

## Wix Integration

The Wix Calendar page embeds:

https://elmohoops.github.io/schedule/

If the repository or GitHub organization is ever renamed, the Wix iframe
URL may also need to be updated.

A GitHub Pages URL change may additionally require updating the Google
Calendar API key's HTTP referrer restrictions.

## Ownership and Future Website Managers

The application is owned by the `elmohoops` GitHub Organization rather
than an individual volunteer's GitHub account.

Future website managers should use their own GitHub accounts and be
granted appropriate access to the `elmohoops` organization.

Do not share a common GitHub username/password between website managers.

The outgoing Website Manager should ensure that the incoming Website
Manager has access to:

-   ELMO Hoops Wix website
-   ELMO Hoops GitHub organization
-   ELMO Hoops Google account / required Google Calendars and Sheets
-   Google Cloud project used for the Calendar API

## Related Applications

### Rosters

Repository:

https://github.com/elmohoops/rosters

GitHub Pages:

https://elmohoops.github.io/rosters/

Roster and coaching information is maintained in Google Sheets.

### Booster Board

Repository:

https://github.com/elmohoops/boosters

GitHub Pages:

https://elmohoops.github.io/boosters/

Booster Board information is maintained in Google Sheets.

### Sponsors

Repository:

https://github.com/elmohoops/sponsors

GitHub Pages:

https://elmohoops.github.io/sponsors/

Sponsor information and display configuration are maintained in Google
Sheets.

## Maintenance Philosophy

The system is intentionally designed so that normal basketball-season
maintenance does not require programming knowledge.

Routine content belongs in:

-   Google Calendar for schedules
-   Google Sheets for rosters, coaches, and Booster Board information
-   Wix for normal website content

GitHub contains the code that presents the dynamic Google data on the
Wix website.

When possible, keep this separation intact.
