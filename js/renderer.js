import { CONFIG } from "./config.js";

const DAYS_PER_PAGE = CONFIG.pagination.dateGroupsPerPage;
const DESKTOP_COLUMNS = 3;
const DESKTOP_ROWS_PER_PAGE = 3;
let currentPage = 0;
let totalPages = 0;
let dayGroups = [];
let currentPages = [];

// Wix changes the iframe width between desktop and mobile layouts.  Use the
// iframe width as the primary breakpoint instead of relying only on hover
// capability (Wix mobile preview still runs inside a desktop browser).
const mobileWidthQuery = window.matchMedia("(max-width: 700px)");
mobileWidthQuery.addEventListener("change", () => {
    if (dayGroups.length === 0)
        return;

    // Desktop and mobile can have different page counts. Start at the first
    // page when crossing the breakpoint so pagination always remains valid.
    currentPage = 0;
    renderSchedule();
});

export function renderSchedulePage(items) {
    currentPage = 0;

    if (items.length === 0) {
        const container = document.getElementById("schedule");
        container.innerHTML = "";
    
        renderSubscribeButtons(container);
        renderEmptyState(container);
    } else {
        dayGroups = groupItemsByDay(items);
        renderSchedule();
    }
}

function renderSchedule() {
    const container = document.getElementById("schedule");
    container.innerHTML = "";

    renderSubscribeButtons(container);
    const page = getCurrentPage(dayGroups);

    // Keep each date and its events together as one layout unit.
    // Desktop CSS can place multiple date groups on the same row;
    // mobile keeps the existing one-date-per-row layout.
    const dayGroupsContainer = document.createElement("div");
    dayGroupsContainer.className = "schedule-day-groups";
    container.appendChild(dayGroupsContainer);

    renderScheduleItems(dayGroupsContainer, page);
    renderPagination(container, dayGroups);

    document.getElementById("schedule").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function buildGoogleCalendarSubscriptionUrl(calendarId) {
    return `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`;
}

function renderSubscribeButtons(container) {
    const section = document.createElement("section");
    section.className = "schedule-subscribe";

    container.appendChild(section);
    
    const heading = document.createElement("h2");
    heading.className = "schedule-subscribe-title";
    heading.textContent = "Subscribe";
    
    section.appendChild(heading);

    const buttons = document.createElement("div");
    buttons.className = "schedule-subscribe-buttons";
    
    section.appendChild(buttons);

    Object.values(CONFIG.calendars).forEach(calendar => {
    
        if (!calendar.enabled)
            return;
    
        // create one button
        const button = document.createElement("a");
        button.className = "schedule-subscribe-button";
        button.style.borderTopColor = calendar.color;
        button.href = buildGoogleCalendarSubscriptionUrl(calendar.id);
        button.target = "_blank";
        button.rel = "noopener noreferrer";
        button.textContent = calendar.name;
        buttons.appendChild(button);
    });
}

function renderEmptyState(container) {
    const empty = document.createElement("div");
    empty.className = "schedule-empty";

    const icon = document.createElement("div");
    icon.className = "schedule-empty-icon";
    icon.textContent = "🏀";

    const title = document.createElement("h2");
    title.textContent = "No Upcoming Games";

    const message1 = document.createElement("p");
    message1.textContent = "The El Modena basketball schedule will be updated as new games are added.";

    const message2 = document.createElement("p");
    message2.textContent = "Go Vanguards!";

    empty.appendChild(icon);
    empty.appendChild(title);
    empty.appendChild(message1);
    empty.appendChild(message2);

    container.appendChild(empty);
}

function groupItemsByDay(items) {
    const dayGroups = [];
    for (const item of items) {
        const key = item.scheduleDay;
        let group = dayGroups.find(
            g => g.scheduleDay === key
        );
        if (!group) {
            group = {
                scheduleDay: key,
                items: []
            };   
            dayGroups.push(group);
        }
        group.items.push(item);
    }
    return dayGroups;
}

// Pagination buttons are rebuilt every time the page changes. Keep the event
// handlers on the persistent #schedule container instead of binding handlers
// to each temporary button. Pointer events give touch devices one native
// activation path without relying on Safari's synthesized click behavior.
const paginationActions = {
    first: firstPage,
    previous: previousPage,
    next: nextPage,
    last: lastPage
};

const scheduleContainer = document.getElementById("schedule");

scheduleContainer.addEventListener("pointerup", (event) => {
    const button = event.target.closest("button[data-pagination-action]");
    if (!button || !scheduleContainer.contains(button) || button.disabled)
        return;

    event.preventDefault();
    const action = paginationActions[button.dataset.paginationAction];
    if (action)
        action();
});

// Preserve keyboard accessibility. Keyboard activation generates a click with
// detail === 0; pointer-generated clicks are ignored because pointerup already
// handled them.
scheduleContainer.addEventListener("click", (event) => {
    if (event.detail !== 0)
        return;

    const button = event.target.closest("button[data-pagination-action]");
    if (!button || !scheduleContainer.contains(button) || button.disabled)
        return;

    const action = paginationActions[button.dataset.paginationAction];
    if (action)
        action();
});

function renderPagination(container, dayGroups) {
    // getCurrentPage() already built the authoritative page set. Rebuild only
    // as a defensive fallback if pagination is rendered independently.
    if (currentPages.length === 0) {
        currentPages = buildPages(dayGroups);
        totalPages = currentPages.length;
    }

    if (totalPages <= 1)
        return;

    const nav = document.createElement("nav");
    nav.className = "schedule-pagination";

    // Content wrapper
    const content = document.createElement("div");
    content.className = "schedule-pagination-content";

    const first = document.createElement("button");
    first.textContent = "«";
    first.setAttribute("aria-label", "First page");
    first.title = "First page";
    first.dataset.paginationAction = "first";
    first.disabled = currentPage === 0;

    const previous = document.createElement("button");
    previous.textContent = "Prev";
    previous.dataset.paginationAction = "previous";
    previous.disabled = currentPage === 0;

    const label = document.createElement("span");
    label.className = "schedule-page-label";
    label.textContent = `${currentPage + 1} / ${totalPages}`;

    const next = document.createElement("button");
    next.textContent = "Next";
    next.dataset.paginationAction = "next";
    next.disabled = currentPage === totalPages - 1;

    const last = document.createElement("button");
    last.textContent = "»";
    last.setAttribute("aria-label", "Last page");
    last.title = "Last page";
    last.dataset.paginationAction = "last";
    last.disabled = currentPage === totalPages - 1;

    content.appendChild(first);
    content.appendChild(previous);
    content.appendChild(label);
    content.appendChild(next);
    content.appendChild(last);
    
    nav.appendChild(content);

    container.appendChild(nav);
}

function renderScheduleItems(container, dayGroups) {

    for (const dayGroup of dayGroups) {
        const daySection = createDaySection(dayGroup);
        daySection.classList.add(`schedule-day-${Math.min(dayGroup.items.length, 3)}-events`);
        if (dayGroup.items.length > 3) {
            daySection.classList.add("schedule-day-many-events");
        }

        const dayGamesContainer = document.createElement("div");
        dayGamesContainer.className = "schedule-day-games";

        for (const item of dayGroup.items) {
            const card = item.type === "event"
                ? createEventCard(item)
                : createGameCard(item);

            dayGamesContainer.appendChild(card);
        }

        daySection.appendChild(dayGamesContainer);
        container.appendChild(daySection);
    }
}

function createDaySection(dayGroup) {
    const daySection = document.createElement("section");
    daySection.className = "schedule-day";

    const heading = document.createElement("h2");
    heading.className = "schedule-date";
    heading.textContent = dayGroup.scheduleDay;

    daySection.appendChild(heading);

    return daySection;
}

function createGameCard(game) {

    const card = document.createElement("article");
    card.className = "schedule-card";

    //
    // Create link to google calendar event
    //
    if (game.source?.htmlLink) {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            window.open(game.source.htmlLink, "_blank");
        });
    }

    //
    // Color Stripe
    //
    const stripe = document.createElement("div");
    stripe.className = "schedule-stripe";
    stripe.style.backgroundColor = game.teamColor;
    
    card.appendChild(stripe);
    
    //
    // Time
    //
    const time = document.createElement("div");
    time.className = "schedule-time";
    time.textContent = game.startTime;

    card.appendChild(time);

    //
    // Team
    //
    const team = document.createElement("div");
    team.className = "schedule-team";
    team.textContent = game.team;

    card.appendChild(team);

    //
    // Opponent
    //
    const opponent = document.createElement("div");
    opponent.className = "schedule-opponent";
    opponent.textContent = `${game.homeAway} ${game.opponent}`;

    card.appendChild(opponent);

    //
    // Optional location
    //
    if (game.location) {
        card.appendChild(createLocationLink(game));
    }

    //
    // Optional notes
    //
    if (game.description) {
        const notes = document.createElement("div");
        notes.className = "schedule-description";
        notes.textContent = game.description;

        card.appendChild(notes);
    }

    return card;
}

function createEventCard(event) {

    const card = document.createElement("article");
    card.className = "schedule-card schedule-event-card";

    //
    // Create link to Google Calendar event
    //
    if (event.source?.htmlLink) {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            window.open(event.source.htmlLink, "_blank");
        });
    }

    //
    // Color Stripe
    //
    const stripe = document.createElement("div");
    stripe.className = "schedule-stripe";
    stripe.style.backgroundColor = event.teamColor;

    card.appendChild(stripe);

    //
    // Time / time range
    //
    const time = document.createElement("div");
    time.className = "schedule-time";
    time.textContent = event.allDay
        ? "ALL DAY"
        : event.endTime
            ? `${event.startTime} – ${event.endTime}`
            : event.startTime;

    card.appendChild(time);

    //
    // Event title
    //
    const title = document.createElement("div");
    title.className = "schedule-event-title";
    title.textContent = event.title;

    card.appendChild(title);

    //
    // Optional location
    //
    if (event.location) {
        card.appendChild(createLocationLink(event));
    }

    //
    // Optional notes
    //
    if (event.description) {
        const notes = document.createElement("div");
        notes.className = "schedule-description";
        notes.textContent = event.description;

        card.appendChild(notes);
    }

    return card;
}

function createLocationLink(item) {
    const location = document.createElement("a");
    location.className = "schedule-location";
    location.textContent = `📍 ${item.shortLocation}`;
    location.href =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(item.location);
    location.target = "_blank";
    location.rel = "noopener noreferrer";
    location.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    return location;
}

function isMobileLayout() {
    // Pagination is based on the actual iframe/page width. This is stable on
    // real phones and in the fixed-width Wix desktop embed.
    return mobileWidthQuery.matches;
}

function buildPages(dayGroups) {
    if (isMobileLayout()) {
        const pages = [];

        for (let i = 0; i < dayGroups.length; i += DAYS_PER_PAGE) {
            pages.push(dayGroups.slice(i, i + DAYS_PER_PAGE));
        }

        return pages;
    }

    const pages = [];
    let page = [];
    let rowsUsed = 0;
    let slotsUsedInRow = 0;

    for (const dayGroup of dayGroups) {
        const eventCount = Math.max(1, dayGroup.items.length);

        // A date with more than one full row of events owns complete rows.
        if (eventCount > DESKTOP_COLUMNS) {
            if (slotsUsedInRow > 0) {
                rowsUsed++;
                slotsUsedInRow = 0;
            }

            const rowsNeeded = Math.ceil(eventCount / DESKTOP_COLUMNS);

            if (page.length > 0 && rowsUsed + rowsNeeded > DESKTOP_ROWS_PER_PAGE) {
                pages.push(page);
                page = [];
                rowsUsed = 0;
            }

            page.push(dayGroup);
            rowsUsed += rowsNeeded;

            if (rowsUsed >= DESKTOP_ROWS_PER_PAGE) {
                pages.push(page);
                page = [];
                rowsUsed = 0;
            }

            continue;
        }

        const slotsNeeded = eventCount;

        if (slotsUsedInRow + slotsNeeded > DESKTOP_COLUMNS) {
            rowsUsed++;
            slotsUsedInRow = 0;
        }

        if (rowsUsed >= DESKTOP_ROWS_PER_PAGE) {
            pages.push(page);
            page = [];
            rowsUsed = 0;
            slotsUsedInRow = 0;
        }

        page.push(dayGroup);
        slotsUsedInRow += slotsNeeded;

        if (slotsUsedInRow === DESKTOP_COLUMNS) {
            rowsUsed++;
            slotsUsedInRow = 0;

            if (rowsUsed >= DESKTOP_ROWS_PER_PAGE) {
                pages.push(page);
                page = [];
                rowsUsed = 0;
            }
        }
    }

    if (page.length > 0) {
        pages.push(page);
    }

    return pages;
}

function getCurrentPage(dayGroups) {
    // Keep one authoritative page set for the current layout. Navigation
    // buttons use this same array instead of rebuilding pages independently.
    currentPages = buildPages(dayGroups);
    totalPages = currentPages.length;

    if (currentPage >= totalPages) {
        currentPage = Math.max(0, totalPages - 1);
    }

    return currentPages[currentPage] || [];
}

function firstPage() {
    if (currentPage > 0) {
        currentPage = 0;
        renderSchedule();
    }
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        renderSchedule();
    }
}

function nextPage() {
    if (currentPage < currentPages.length - 1) {
        currentPage++;
        renderSchedule();
    }
}

function lastPage() {
    if (currentPage < currentPages.length - 1) {
        currentPage = currentPages.length - 1;
        renderSchedule();
    }
}
