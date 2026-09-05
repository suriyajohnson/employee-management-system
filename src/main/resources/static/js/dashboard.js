"use strict";
const $ = (s, r = document) => r.querySelector(s);
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const paths = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  building:
    "M4 21V3h12v18 M16 9h4v12 M2 21h20 M8 7h4 M8 11h4 M8 15h4 M8 21v-2h4v2",
  calendar: "M4 5h16v16H4z M16 3v4 M8 3v4 M4 11h16 M8 15h2 M14 15h2",
  wallet: "M3 5h17v15H3z M3 5V3h14 M16 11h6v5h-6z",
  chart: "M3 3v18h18 M7 16v-5 M12 16V7 M17 16v-8",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z",
  logout: "M9 21H3V3h6 M9 12h12 M17 8l4 4-4 4",
  search: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  sun: "M12 3V1 M12 23v-2 M3 12H1 M23 12h-2 M4 4l2 2 M18 18l2 2 M20 4l-2 2 M6 18l-2 2 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  close: "M6 6l12 12 M18 6L6 18",
  plus: "M12 5v14 M5 12h14",
  download: "M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",
  edit: "M15 4l5 5 M4 16l-1 5 5-1L21 7l-5-5z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  trash: "M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7",
  arrow: "M4 12h16 M15 7l5 5-5 5",
  check: "M5 12l4 4L19 6",
  refresh: "M20 7V2l-3 3a9 9 0 1 0 4 9 M20 7h-5",
};
const icon = (n) =>
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
  (paths[n] || paths.grid) +
  '"/></svg>';
document
  .querySelectorAll("[data-icon]")
  .forEach((e) => (e.innerHTML = icon(e.dataset.icon)));
const today = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};
const state = {
  employees: [],
  departments: [],
  attendance: [],
  page: "dashboard",
  query: "",
  department: "",
  status: "",
  sort: "name",
  pageNumber: 1,
  date: today(),
  attendanceDirty: false,
  attendanceSaving: false,
  attendanceLoaded: false,
  loaded: false,
};
const palette = [
  "#54846a",
  "#a9c491",
  "#d9bd80",
  "#9eacc6",
  "#c89e94",
  "#a0b8ab",
];
let preferences = {
  name: "Administrator",
  company: "PeopleDesk",
  theme: "light",
};
try {
  preferences = {
    ...preferences,
    ...JSON.parse(localStorage.getItem("peopledesk.preferences") || "{}"),
  };
} catch {}
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
const dateLabel = (v) =>
  v
    ? new Date(v + "T12:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not provided";
const initials = (v) =>
  String(v || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
const deptName = (id) =>
  state.departments.find((d) => d.id === id)?.name || "Unassigned";
const active = () => state.employees.filter((e) => e.status === "ACTIVE");
const totalSalary = (rows) =>
  rows.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
const button = (text, action, kind = "secondary", symbol = "") =>
  '<button class="button ' +
  kind +
  '" data-action="' +
  action +
  '">' +
  (symbol ? icon(symbol) : "") +
  text +
  "</button>";
function notify(message) {
  const el = $("#toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => (el.hidden = true), 4500);
}
async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!response.ok) {
    if (response.status === 401) location.href = "index.html";
    throw new Error(
      data?.message ||
        "Request failed (" + response.status + "). Please try again.",
    );
  }
  return data;
}
function applyPreferences() {
  document.body.classList.toggle("dark", preferences.theme === "dark");
  $("#adminName").textContent = preferences.name;
  $("#adminInitial").textContent = initials(preferences.name);
  $("#themeToggle").setAttribute(
    "aria-label",
    preferences.theme === "dark" ? "Use light theme" : "Use dark theme",
  );
}
function savePreferences() {
  localStorage.setItem("peopledesk.preferences", JSON.stringify(preferences));
  applyPreferences();
}
async function reload() {
  $("#loadError").hidden = true;
  try {
    const result = await Promise.all([
      api("/allemployee"),
      api("/api/admin/departments"),
    ]);
    state.employees = result[0];
    state.departments = result[1];
    state.loaded = true;
    $("#navCount").textContent = state.employees.length;
    render();
  } catch (error) {
    $("#loadError").innerHTML =
      esc(error.message) + " " + button("Retry", "reload");
    $("#loadError").hidden = false;
    if (!state.loaded)
      $("#view").innerHTML = empty(
        "Workspace unavailable",
        "Your data could not be loaded. Check the server connection, then retry.",
        "refresh",
      );
  }
}
function empty(title, description, symbol = "users", action = "") {
  return (
    '<div class="empty">' +
    icon(symbol) +
    "<h3>" +
    esc(title) +
    "</h3><p>" +
    esc(description) +
    "</p>" +
    action +
    "</div>"
  );
}
function stat(label, value, note, symbol) {
  return (
    '<div class="stat-card"><div class="stat-top">' +
    label +
    '<span class="stat-symbol">' +
    icon(symbol) +
    '</span></div><div class="stat-value">' +
    value +
    '</div><div class="stat-note">' +
    note +
    "</div></div>"
  );
}
function employeePerson(e) {
  return (
    '<div class="person"><span class="avatar" style="background:' +
    palette[e.id % palette.length] +
    "25;color:" +
    palette[e.id % palette.length] +
    '">' +
    esc(initials(e.name)) +
    "</span><div><strong>" +
    esc(e.name) +
    "</strong><small>" +
    esc(e.email) +
    "</small></div></div>"
  );
}
function rowActions(e) {
  return (
    '<div class="row-actions">' +
    [
      ["view", "eye", "View employee"],
      ["edit", "edit", "Edit employee"],
      ["delete", "trash", "Delete employee"],
    ]
      .map(
        ([a, i, t]) =>
          '<button data-action="' +
          a +
          '-employee" data-id="' +
          e.id +
          '" aria-label="' +
          t +
          " " +
          esc(e.name) +
          '" title="' +
          t +
          '">' +
          icon(i) +
          "</button>",
      )
      .join("") +
    "</div>"
  );
}
function employeeTable(rows, compact = false) {
  if (!rows.length)
    return empty(
      state.employees.length
        ? "No matching employees"
        : "Your team starts here",
      state.employees.length
        ? "Try another search or filter."
        : "Add your first employee to bring your workspace to life.",
      "users",
      !state.employees.length
        ? button("Add employee", "add-employee", "primary", "plus")
        : "",
    );
  return (
    '<div class="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Designation</th>' +
    (compact ? "" : "<th>Monthly salary</th>") +
    "<th>Status</th><th>Actions</th></tr></thead><tbody>" +
    rows
      .map(
        (e) =>
          "<tr><td>" +
          employeePerson(e) +
          "</td><td>" +
          esc(deptName(e.departmentId)) +
          "</td><td>" +
          esc(e.designation || "—") +
          "</td>" +
          (compact ? "" : "<td>" + money(e.salary) + "</td>") +
          '<td><span class="badge ' +
          (e.status === "ACTIVE" ? "" : "inactive") +
          '">' +
          esc(e.status || "Unknown") +
          "</span></td><td>" +
          rowActions(e) +
          "</td></tr>",
      )
      .join("") +
    "</tbody></table></div>"
  );
}
function departmentGroups() {
  const groups = state.departments.map((d) => ({
    name: d.name,
    count: state.employees.filter((e) => e.departmentId === d.id).length,
  }));
  const missing = state.employees.filter(
    (e) => !state.departments.some((d) => d.id === e.departmentId),
  ).length;
  if (missing) groups.push({ name: "Unassigned", count: missing });
  return groups.filter((g) => g.count).sort((a, b) => b.count - a.count);
}
function overview() {
  const recent = [...state.employees]
    .sort((a, b) =>
      (b.dateOfJoining || "").localeCompare(a.dateOfJoining || ""),
    )
    .slice(0, 5);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 5 + i);
    const key =
      d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    return {
      label: d.toLocaleDateString("en", { month: "short" }),
      count: state.employees.filter((e) =>
        (e.dateOfJoining || "").startsWith(key),
      ).length,
    };
  });
  const max = Math.max(...months.map((m) => m.count), 1),
    groups = departmentGroups(),
    total = state.employees.length;
  let offset = 0;
  const gradient = groups
    .map((g, i) => {
      const from = offset;
      offset += (g.count / total) * 100;
      return palette[i % palette.length] + " " + from + "% " + offset + "%";
    })
    .join(",");
  const unassigned = state.employees.filter((e) => !e.departmentId).length;
  return (
    '<div class="welcome"><div><h2>Welcome back, ' +
    esc(preferences.name.split(" ")[0]) +
    '.</h2><p>Here’s what’s happening with your team today.</p></div><div class="welcome-art"><span class="date-chip">' +
    dateLabel(today()) +
    '</span><div class="orb">' +
    icon("users") +
    "</div></div></div>" +
    '<div class="stats-grid">' +
    stat(
      "Total employees",
      total,
      "<strong>" + months[5].count + " joined</strong> this month",
      "users",
    ) +
    stat(
      "Active employees",
      active().length,
      "<strong>" +
        Math.round(total ? (active().length / total) * 100 : 0) +
        "%</strong> of your workforce",
      "check",
    ) +
    stat(
      "Departments",
      state.departments.length,
      "Teams working together",
      "building",
    ) +
    stat(
      "Monthly base payroll",
      money(totalSalary(active())),
      "Current active employee salaries",
      "wallet",
    ) +
    "</div>" +
    '<div class="grid-two"><section class="panel"><div class="panel-head"><div><h2>New joiners</h2><p>Joining dates of current employee records</p></div><span class="tag">Last 6 months</span></div><div class="panel-body"><div class="bar-chart" role="img" aria-label="' +
    esc(months.map((m) => m.label + ": " + m.count).join(", ")) +
    '">' +
    months
      .map(
        (m) =>
          '<div class="bar-col"><span>' +
          m.count +
          '</span><div class="bar" style="height:' +
          (m.count / max) * 83 +
          '%"></div></div>',
      )
      .join("") +
    '</div><div class="bar-labels">' +
    months.map((m) => "<span>" + m.label + "</span>").join("") +
    "</div></div></section>" +
    '<section class="panel"><div class="panel-head"><div><h2>Team distribution</h2><p>People across your departments</p></div>' +
    icon("building") +
    '</div><div class="panel-body">' +
    (total
      ? '<div class="distribution"><div class="donut" style="background:conic-gradient(' +
        gradient +
        ')"><div class="donut-center"><strong>' +
        total +
        '</strong><small>EMPLOYEES</small></div></div><div class="legend">' +
        groups
          .map(
            (g, i) =>
              '<div class="legend-row"><span class="legend-dot" style="background:' +
              palette[i % palette.length] +
              '"></span><span>' +
              esc(g.name) +
              "</span><strong>" +
              g.count +
              "</strong></div>",
          )
          .join("") +
        "</div></div>"
      : empty(
          "Room to grow",
          "Your department breakdown will appear here.",
          "building",
        )) +
    "</div></section></div>" +
    '<section class="panel"><div class="panel-head"><div><h2>Recently joined employees</h2><p>Get to know the people behind the work</p></div><button class="text-button" data-page="employees">View all employees ' +
    icon("arrow") +
    "</button></div>" +
    employeeTable(recent, true) +
    "</section>" +
    '<div class="grid-two"><section class="panel"><div class="panel-head"><h2>Make your next move</h2><span class="tag">Quick actions</span></div><div class="panel-body quick-grid">' +
    [
      ["add-employee", "users", "Add employee", "Grow your team"],
      ["attendance", "calendar", "Mark attendance", "Keep the day on track"],
      ["reports", "chart", "Export a report", "Take your data with you"],
    ]
      .map(
        ([action, i, title, sub]) =>
          '<button class="quick-action" data-action="' +
          action +
          '">' +
          icon(i) +
          "<strong>" +
          title +
          "</strong><small>" +
          sub +
          "</small></button>",
      )
      .join("") +
    "</div></section>" +
    '<section class="panel"><div class="panel-head"><h2>Workspace insights</h2></div><div class="panel-body"><div class="insight"><span class="insight-icon">' +
    icon("building") +
    "</span><div><strong>" +
    unassigned +
    ' employees without a department</strong><p>Assign a team from the employee editor.</p></div></div><div class="insight"><span class="insight-icon">' +
    icon("users") +
    "</span><div><strong>" +
    state.employees.filter((e) => e.status === "INACTIVE").length +
    " inactive employees</strong><p>Review employment status in your directory.</p></div></div></div></section></div>"
  );
}
function filteredEmployees() {
  return state.employees
    .filter(
      (e) =>
        (!state.query ||
          [
            e.name,
            e.email,
            e.employeeCode,
            e.designation,
            deptName(e.departmentId),
          ].some((v) =>
            String(v || "")
              .toLowerCase()
              .includes(state.query.toLowerCase()),
          )) &&
        (!state.department ||
          (state.department === "unassigned"
            ? !e.departmentId
            : String(e.departmentId) === state.department)) &&
        (!state.status || e.status === state.status),
    )
    .sort((a, b) =>
      state.sort === "salary"
        ? b.salary - a.salary
        : state.sort === "newest"
          ? (b.dateOfJoining || "").localeCompare(a.dateOfJoining || "")
          : String(a.name).localeCompare(String(b.name)),
    );
}
function departmentOptions(value = "", all = true) {
  return (
    (all
      ? '<option value="">All departments</option><option value="unassigned" ' +
        (value === "unassigned" ? "selected" : "") +
        ">Unassigned</option>"
      : '<option value="">Unassigned</option>') +
    state.departments
      .map(
        (d) =>
          '<option value="' +
          d.id +
          '" ' +
          (String(value) === String(d.id) ? "selected" : "") +
          ">" +
          esc(d.name) +
          "</option>",
      )
      .join("")
  );
}
function employeesView() {
  const rows = filteredEmployees(),
    pages = Math.max(1, Math.ceil(rows.length / 8));
  state.pageNumber = Math.min(state.pageNumber, pages);
  return (
    '<section class="panel"><div class="panel-head"><div><h2>Employee directory <span class="tag">' +
    state.employees.length +
    " people</span></h2><p>Manage employee profiles, roles, and team assignments</p></div>" +
    button("Export filtered CSV", "export-employees", "secondary", "download") +
    '</div><div class="toolbar"><input type="search" id="employeeSearch" placeholder="Search name, code, email or role..." aria-label="Search employees" value="' +
    esc(state.query) +
    '"><select id="departmentFilter" aria-label="Filter by department">' +
    departmentOptions(state.department) +
    '</select><select id="statusFilter" aria-label="Filter by status"><option value="">All statuses</option>' +
    ["ACTIVE", "INACTIVE"]
      .map(
        (s) =>
          "<option " +
          (state.status === s ? "selected" : "") +
          ">" +
          s +
          "</option>",
      )
      .join("") +
    '</select><select id="sortFilter" aria-label="Sort employees">' +
    [
      ["name", "Name A–Z"],
      ["newest", "Newest joining date"],
      ["salary", "Salary: high to low"],
    ]
      .map(
        ([v, l]) =>
          '<option value="' +
          v +
          '" ' +
          (state.sort === v ? "selected" : "") +
          ">" +
          l +
          "</option>",
      )
      .join("") +
    "</select></div>" +
    employeeTable(
      rows.slice((state.pageNumber - 1) * 8, state.pageNumber * 8),
    ) +
    '<div class="pagination"><span>' +
    rows.length +
    " results · Page " +
    state.pageNumber +
    " of " +
    pages +
    '</span><div class="actions"><button class="button secondary" data-action="previous" ' +
    (state.pageNumber === 1 ? "disabled" : "") +
    '>Previous</button><button class="button secondary" data-action="next" ' +
    (state.pageNumber === pages ? "disabled" : "") +
    ">Next</button></div></div></section>"
  );
}
function departmentsView() {
  if (!state.departments.length)
    return (
      '<section class="panel">' +
      empty(
        "Give every team a home",
        "Create departments, add a manager, and assign employees.",
        "building",
        button("Create department", "add-department", "primary", "plus"),
      ) +
      "</section>"
    );
  return (
    '<div class="department-grid">' +
    state.departments
      .map((d) => {
        const members = state.employees.filter((e) => e.departmentId === d.id);
        return (
          '<article class="department-card"><div class="department-top">' +
          icon("building") +
          '<span class="tag">' +
          members.length +
          " people</span></div><h2>" +
          esc(d.name) +
          "</h2><p>" +
          esc(d.description || "No description added yet.") +
          '</p><div class="department-meta"><span class="muted">Manager</span><strong>' +
          esc(d.manager || "Not assigned") +
          '</strong></div><div class="actions"><button class="button secondary" data-action="department-members" data-id="' +
          d.id +
          '">View team</button><button class="button secondary" data-action="edit-department" data-id="' +
          d.id +
          '">Edit</button><button class="button danger" data-action="delete-department" data-id="' +
          d.id +
          '" aria-label="Delete ' +
          esc(d.name) +
          '">' +
          icon("trash") +
          "</button></div></article>"
        );
      })
      .join("") +
    "</div>"
  );
}
function attendanceView() {
  return (
    '<div class="notice">Record daily attendance for active employees. Saved records remain available when an employee becomes inactive.</div><section class="panel"><div class="panel-head"><div><h2>Daily attendance</h2><p>Select a date, mark your team, then save changes.</p></div><div class="actions"><input class="field" type="date" id="attendanceDate" value="' +
    state.date +
    '" max="' +
    today() +
    '" aria-label="Attendance date">' +
    button("Export CSV", "export-attendance", "secondary", "download") +
    '</div></div><div id="attendanceContent">' +
    empty("Loading attendance", "Please wait.", "calendar") +
    "</div></section>"
  );
}
let attendanceRequest = 0;
async function loadAttendance() {
  const request = ++attendanceRequest;
  const date = state.date;
  state.attendanceLoaded = false;
  if (state.page === "attendance")
    $("#attendanceContent").innerHTML = empty(
      "Loading attendance",
      "Please wait.",
      "calendar",
    );
  try {
    const rows = await api("/api/admin/attendance?date=" + date);
    if (
      state.page !== "attendance" ||
      date !== state.date ||
      request !== attendanceRequest
    )
      return;
    state.attendance = rows;
    state.attendanceDirty = false;
    state.attendanceLoaded = true;
    const employees = state.employees.filter(
      (e) => e.status === "ACTIVE" || rows.some((r) => r.employeeId === e.id),
    );
    $("#attendanceContent").innerHTML = employees.length
      ? '<div class="toolbar">' +
        button("Mark all present", "mark-present") +
        '<span class="muted" id="attendanceSummary">' +
        rows.length +
        " recorded · " +
        employees.length +
        ' employees</span></div><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Attendance status</th></tr></thead><tbody>' +
        employees
          .map((e) => {
            const status =
              rows.find((r) => r.employeeId === e.id)?.status || "";
            return (
              "<tr><td>" +
              employeePerson(e) +
              "</td><td>" +
              esc(deptName(e.departmentId)) +
              '</td><td><select class="field attendance-status" data-id="' +
              e.id +
              '" aria-label="Attendance for ' +
              esc(e.name) +
              '"><option value="" ' +
              (!status ? "selected" : "") +
              " " +
              (status ? "disabled" : "") +
              ">Not marked</option>" +
              ["PRESENT", "ABSENT", "LEAVE", "REMOTE"]
                .map(
                  (s) =>
                    "<option " +
                    (status === s ? "selected" : "") +
                    ">" +
                    s +
                    "</option>",
                )
                .join("") +
              "</select></td></tr>"
            );
          })
          .join("") +
        '</tbody></table></div><div class="pagination"><span>Unmarked entries are not saved.</span>' +
        button("Save attendance", "save-attendance", "primary", "check") +
        "</div>"
      : empty(
          "No employees to mark",
          "Add an active employee to start recording attendance.",
          "calendar",
        );
  } catch (error) {
    if (
      state.page === "attendance" &&
      date === state.date &&
      request === attendanceRequest
    )
      $("#attendanceContent").innerHTML = empty(
        "Attendance unavailable",
        error.message,
        "calendar",
        button("Retry", "reload-attendance"),
      );
  }
}
function payrollView() {
  const rows = active();
  return (
    '<div class="notice">Current monthly base salaries in INR. This is a salary planning summary; deductions, taxes, attendance adjustments, and payment processing are not included.</div><div class="stats-grid">' +
    stat("Eligible employees", rows.length, "Active employees only", "users") +
    stat(
      "Monthly base total",
      money(totalSalary(rows)),
      "Before deductions and additions",
      "wallet",
    ) +
    stat(
      "Average base salary",
      money(rows.length ? totalSalary(rows) / rows.length : 0),
      "Per active employee",
      "chart",
    ) +
    stat(
      "Annual projection",
      money(totalSalary(rows) * 12),
      "Current monthly total × 12",
      "calendar",
    ) +
    '</div><section class="panel"><div class="panel-head"><div><h2>Salary breakdown</h2><p>Use Edit salary to update an employee’s monthly base pay</p></div>' +
    button("Export payroll CSV", "export-payroll", "secondary", "download") +
    "</div>" +
    (rows.length
      ? '<div class="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Monthly base</th><th>Annual projection</th><th>Action</th></tr></thead><tbody>' +
        rows
          .map(
            (e) =>
              "<tr><td>" +
              employeePerson(e) +
              "</td><td>" +
              esc(deptName(e.departmentId)) +
              "</td><td>" +
              money(e.salary) +
              "</td><td>" +
              money(e.salary * 12) +
              '</td><td><button class="text-button" data-action="edit-employee" data-id="' +
              e.id +
              '">Edit salary</button></td></tr>',
          )
          .join("") +
        "</tbody></table></div>"
      : empty(
          "No active employees",
          "Activate an employee to include their salary here.",
          "wallet",
        )) +
    "</section>"
  );
}
function reportsView() {
  return (
    '<div class="report-grid">' +
    [
      [
        "users",
        "Employee directory",
        "Contact information, department, designation, status, joining date and salary for your entire team.",
        "export-all",
      ],
      [
        "building",
        "Department summary",
        "Headcount, active employees and monthly base salary totals for each department.",
        "export-departments",
      ],
      [
        "wallet",
        "Base payroll report",
        "Current active employee salaries, with monthly totals and annual projections in INR.",
        "export-payroll",
      ],
    ]
      .map(
        ([i, t, d, a]) =>
          '<article class="department-card"><div class="department-top">' +
          icon(i) +
          '<span class="tag">CSV</span></div><h2>' +
          t +
          "</h2><p>" +
          d +
          '</p><div class="actions">' +
          button("Download report", a, "primary", "download") +
          "</div></article>",
      )
      .join("") +
    '</div><section class="panel" style="margin-top:24px"><div class="panel-head"><div><h2>Daily attendance report</h2><p>Choose a date in Attendance, then export the saved records for that day.</p></div><button class="button secondary" data-page="attendance">' +
    icon("calendar") +
    "Open attendance</button></div></section>"
  );
}
function settingsView() {
  return (
    '<div class="settings-grid"><section class="panel"><div class="panel-head"><div><h2>Make this workspace yours</h2><p>Display preferences are saved in this browser.</p></div></div><div class="panel-body"><form id="settingsForm"><div class="form-grid">' +
    field(
      "Display name",
      "name",
      "text",
      preferences.name,
      'required maxlength="80"',
    ) +
    field(
      "Workspace label",
      "company",
      "text",
      preferences.company,
      'required maxlength="80"',
    ) +
    '<label class="form-field full-width">Appearance<select class="field" name="theme"><option value="light">Light · Fresh and clear</option><option value="dark" ' +
    (preferences.theme === "dark" ? "selected" : "") +
    '>Dark · Easy on the eyes</option></select></label></div><p class="form-hint">These preferences change your display only. They do not change your login account.</p><button class="button primary" type="submit">Save preferences</button></form></div></section><section class="panel"><div class="panel-head"><h2>Workspace information</h2></div><div class="panel-body"><dl class="details-grid"><div><dt>Application</dt><dd>PeopleDesk</dd></div><div><dt>Currency</dt><dd>INR · Indian rupee</dd></div><div><dt>Employee records</dt><dd>' +
    state.employees.length +
    "</dd></div><div><dt>Departments</dt><dd>" +
    state.departments.length +
    '</dd></div></dl><p class="form-hint">Employee, department, and attendance changes are stored by the application server.</p>' +
    button("Refresh workspace data", "reload", "secondary", "refresh") +
    "</div></section></div>"
  );
}
const pageInfo = {
  dashboard: [
    "Overview",
    "People overview",
    "A good day starts with a connected team.",
  ],
  employees: [
    "Employees",
    "Your people, all together",
    "A little organization. A lot of possibility.",
  ],
  departments: [
    "Departments",
    "Better work starts with great teams",
    "Give every employee a place to belong.",
  ],
  attendance: [
    "Attendance",
    "Every day, accounted for",
    "Keep a clear picture of who is here and how they work.",
  ],
  payroll: [
    "Payroll summary",
    "A clear view of your payroll",
    "Plan confidently with current employee salary data.",
  ],
  reports: [
    "Reports",
    "Your workspace, in perspective",
    "Useful reports, ready for your next decision.",
  ],
  settings: [
    "Settings",
    "A workspace that feels like yours",
    "Manage your display preferences and workspace appearance.",
  ],
};
function render() {
  const info = pageInfo[state.page];
  $("#breadcrumb").textContent = info[0];
  $("#pageTitle").textContent = info[1];
  $("#pageSubtitle").textContent = info[2];
  $("#eyebrow").textContent =
    state.page === "dashboard"
      ? "YOUR WORKSPACE, AT A GLANCE"
      : preferences.company.toUpperCase() + " / " + info[0].toUpperCase();
  document.querySelectorAll(".sidebar [data-page]").forEach((b) => {
    b.classList.toggle("active", b.dataset.page === state.page);
    if (b.dataset.page === state.page) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  $("#headingActions").innerHTML = ["dashboard", "employees"].includes(
    state.page,
  )
    ? button("Add employee", "add-employee", "primary", "plus")
    : state.page === "departments"
      ? button("Create department", "add-department", "primary", "plus")
      : state.page === "reports"
        ? button("Print overview", "print", "secondary", "download")
        : "";
  if (!state.loaded) return;
  $("#view").innerHTML = {
    dashboard: overview,
    employees: employeesView,
    departments: departmentsView,
    attendance: attendanceView,
    payroll: payrollView,
    reports: reportsView,
    settings: settingsView,
  }[state.page]();
  if (state.page === "attendance") loadAttendance();
}
function navigate(page) {
  if (state.attendanceSaving) {
    notify("Please wait for attendance to finish saving.");
    return;
  }
  if (!pageInfo[page]) page = "dashboard";
  if (
    state.attendanceDirty &&
    !confirm("Leave without saving attendance changes?")
  ) {
    history.replaceState(null, "", "#" + state.page);
    return;
  }
  state.attendanceDirty = false;
  state.page = page;
  history.replaceState(null, "", "#" + page);
  $("#sidebar").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
  render();
}
function field(label, name, type, value = "", attrs = "") {
  return (
    '<label class="form-field">' +
    label +
    '<input class="field" name="' +
    name +
    '" type="' +
    type +
    '" value="' +
    esc(value) +
    '" ' +
    attrs +
    "></label>"
  );
}
let editorSave = null;
function openDialog(title, html, save = null, label = "Save changes") {
  $("#dialogTitle").textContent = title;
  $("#dialogFields").innerHTML = html;
  $("#formError").textContent = "";
  $("#saveButton").hidden = !save;
  $("#saveButton").textContent = label;
  $("#saveButton").disabled = false;
  editorSave = save;
  $("#editor").showModal();
}
function editEmployee(id) {
  const e = state.employees.find((e) => e.id === id) || {};
  const html =
    '<div class="form-grid">' +
    field(
      "Employee code *",
      "employeeCode",
      "text",
      e.employeeCode,
      'required maxlength="40"',
    ) +
    field("Full name *", "name", "text", e.name, 'required maxlength="100"') +
    field(
      "Email address *",
      "email",
      "email",
      e.email,
      'required maxlength="254"',
    ) +
    field("Mobile number", "mobile", "tel", e.mobile, 'maxlength="30"') +
    field(
      "Designation *",
      "designation",
      "text",
      e.designation,
      'required maxlength="100"',
    ) +
    '<label class="form-field">Department<select class="field" name="departmentId">' +
    departmentOptions(e.departmentId || "", false) +
    "</select></label>" +
    field(
      "Monthly base salary (INR) *",
      "salary",
      "number",
      e.salary ?? "",
      'required min="0" step="0.01"',
    ) +
    field(
      "Date of joining *",
      "dateOfJoining",
      "date",
      e.dateOfJoining || today(),
      "required",
    ) +
    '<label class="form-field">Employee status<select class="field" name="status">' +
    ["ACTIVE", "INACTIVE"]
      .map(
        (s) =>
          "<option " +
          (e.status === s ? "selected" : "") +
          ">" +
          s +
          "</option>",
      )
      .join("") +
    "</select></label></div>";
  openDialog(
    id ? "Edit employee" : "Add a new employee",
    html,
    async (data) => {
      const payload = {
        ...Object.fromEntries(data),
        id: id || 0,
        salary: Number(data.get("salary")),
        departmentId: data.get("departmentId")
          ? Number(data.get("departmentId"))
          : null,
      };
      await api("/employee", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
    },
    id ? "Save changes" : "Add employee",
  );
}
function editDepartment(id) {
  const d = state.departments.find((d) => d.id === id) || {};
  openDialog(
    id ? "Edit department" : "Create a department",
    '<div class="form-grid">' +
      field(
        "Department name *",
        "name",
        "text",
        d.name,
        'required maxlength="100"',
      ) +
      field("Manager name", "manager", "text", d.manager, 'maxlength="100"') +
      '<label class="form-field full-width">Description<textarea class="field" name="description" maxlength="1000">' +
      esc(d.description) +
      "</textarea></label></div>",
    async (data) =>
      api("/api/admin/departments", {
        method: "POST",
        body: JSON.stringify({ ...Object.fromEntries(data), id: id || null }),
      }),
  );
}
function viewEmployee(id) {
  const e = state.employees.find((e) => e.id === id);
  if (!e) return;
  openDialog(
    e.name,
    employeePerson(e) +
      '<dl class="details-grid">' +
      [
        ["Employee code", e.employeeCode],
        ["Department", deptName(e.departmentId)],
        ["Designation", e.designation],
        ["Mobile", e.mobile || "Not provided"],
        ["Monthly base salary", money(e.salary)],
        ["Status", e.status],
        ["Joining date", dateLabel(e.dateOfJoining)],
      ]
        .map(([k, v]) => "<div><dt>" + k + "</dt><dd>" + esc(v) + "</dd></div>")
        .join("") +
      "</dl>",
  );
}
function csv(name, headers, rows) {
  if (!rows.length) {
    notify("There are no records to export.");
    return;
  }
  const cell = (value) => {
    let s = String(value ?? "");
    if (/^[\s]*[=+\-@]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const blob = new Blob(
    [
      "\ufeff" +
        [headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8;" },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name + "-" + today() + ".csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify("Report downloaded.");
}
function exportEmployees(rows) {
  csv(
    "employees",
    [
      "Code",
      "Name",
      "Email",
      "Mobile",
      "Department",
      "Designation",
      "Monthly base INR",
      "Status",
      "Joining date",
    ],
    rows.map((e) => [
      e.employeeCode,
      e.name,
      e.email,
      e.mobile,
      deptName(e.departmentId),
      e.designation,
      e.salary,
      e.status,
      e.dateOfJoining,
    ]),
  );
}
async function action(name, id, source) {
  switch (name) {
    case "reload":
      if (state.attendanceSaving) return;
      if (
        state.attendanceDirty &&
        !confirm("Discard unsaved attendance and refresh?")
      )
        return;
      state.attendanceDirty = false;
      await reload();
      break;
    case "add-employee":
      editEmployee();
      break;
    case "edit-employee":
      editEmployee(id);
      break;
    case "view-employee":
      viewEmployee(id);
      break;
    case "delete-employee": {
      const e = state.employees.find((e) => e.id === id);
      if (
        !e ||
        !confirm(
          "Delete " +
            e.name +
            " and their attendance records? This cannot be undone.",
        )
      )
        return;
      await api("/delete/" + id, { method: "DELETE" });
      notify("Employee deleted.");
      await reload();
      break;
    }
    case "add-department":
      editDepartment();
      break;
    case "edit-department":
      editDepartment(id);
      break;
    case "delete-department":
      if (
        !confirm("Delete this department? Employees must be reassigned first.")
      )
        return;
      await api("/api/admin/departments/" + id, { method: "DELETE" });
      notify("Department deleted.");
      await reload();
      break;
    case "department-members":
      state.department = String(id);
      state.query = "";
      state.status = "";
      state.pageNumber = 1;
      navigate("employees");
      break;
    case "previous":
      state.pageNumber--;
      render();
      break;
    case "next":
      state.pageNumber++;
      render();
      break;
    case "attendance":
      navigate("attendance");
      break;
    case "reports":
      navigate("reports");
      break;
    case "reload-attendance":
      await loadAttendance();
      break;
    case "mark-present":
      if (state.attendanceSaving) return;
      document
        .querySelectorAll(".attendance-status")
        .forEach((s) => (s.value = "PRESENT"));
      state.attendanceDirty = true;
      $("#attendanceSummary").textContent = "Unsaved changes";
      break;
    case "save-attendance": {
      const entries = [...document.querySelectorAll(".attendance-status")]
        .filter((s) => s.value)
        .map((s) => ({ employeeId: Number(s.dataset.id), status: s.value }));
      if (!entries.length) {
        notify("Mark at least one employee first.");
        return;
      }
      source.disabled = true;
      state.attendanceSaving = true;
      $("#attendanceDate").disabled = true;
      document
        .querySelectorAll(".attendance-status")
        .forEach((s) => (s.disabled = true));
      try {
        await api("/api/admin/attendance", {
          method: "POST",
          body: JSON.stringify({ date: state.date, entries }),
        });
        state.attendanceDirty = false;
        notify("Attendance saved.");
        await loadAttendance();
      } finally {
        source.disabled = false;
        state.attendanceSaving = false;
        if ($("#attendanceDate")) $("#attendanceDate").disabled = false;
        document
          .querySelectorAll(".attendance-status")
          .forEach((s) => (s.disabled = false));
      }
      break;
    }
    case "export-employees":
      exportEmployees(filteredEmployees());
      break;
    case "export-all":
      exportEmployees(state.employees);
      break;
    case "export-payroll":
      csv(
        "base-payroll",
        [
          "Employee code",
          "Name",
          "Department",
          "Monthly base INR",
          "Annual projection INR",
        ],
        active().map((e) => [
          e.employeeCode,
          e.name,
          deptName(e.departmentId),
          e.salary,
          e.salary * 12,
        ]),
      );
      break;
    case "export-departments":
      csv(
        "departments",
        [
          "Department",
          "Manager",
          "Employees",
          "Active employees",
          "Active monthly base INR",
        ],
        [
          ...state.departments,
          { id: null, name: "Unassigned", manager: "" },
        ].map((d) => {
          const rows = state.employees.filter(
            (e) => (e.departmentId || null) === d.id,
          );
          return [
            d.name,
            d.manager,
            rows.length,
            rows.filter((e) => e.status === "ACTIVE").length,
            totalSalary(rows.filter((e) => e.status === "ACTIVE")),
          ];
        }),
      );
      break;
    case "export-attendance":
      if (!state.attendanceLoaded) {
        notify("Load attendance before exporting.");
        return;
      }
      if (state.attendanceDirty) {
        notify("Save attendance changes before exporting.");
        return;
      }
      csv(
        "attendance-" + state.date,
        ["Date", "Employee code", "Name", "Status"],
        state.attendance.map((r) => {
          const e = state.employees.find((e) => e.id === r.employeeId);
          return [r.workDate, e?.employeeCode, e?.name, r.status];
        }),
      );
      break;
    case "print":
      navigate("dashboard");
      window.print();
      break;
  }
}
document.addEventListener("click", async (event) => {
  const page = event.target.closest("[data-page]");
  if (page) {
    navigate(page.dataset.page);
    return;
  }
  const trigger = event.target.closest("[data-action]");
  if (!trigger || trigger.disabled) return;
  try {
    await action(trigger.dataset.action, Number(trigger.dataset.id), trigger);
  } catch (error) {
    notify(error.message);
  }
});
$("#editorForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!editorSave) return;
  $("#saveButton").disabled = true;
  $("#formError").textContent = "";
  try {
    await editorSave(new FormData(event.target));
    $("#editor").close();
    notify("Changes saved successfully.");
    await reload();
  } catch (error) {
    $("#formError").textContent = error.message;
  } finally {
    $("#saveButton").disabled = false;
  }
});
$("#closeDialog").onclick = $("#cancelDialog").onclick = () =>
  $("#editor").close();
document.addEventListener("submit", (event) => {
  if (event.target.id !== "settingsForm") return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  if (!data.name.trim() || !data.company.trim()) {
    notify("Enter a display name and workspace label.");
    return;
  }
  try {
    preferences = {
      name: data.name.trim(),
      company: data.company.trim(),
      theme: data.theme,
    };
    savePreferences();
    render();
    notify("Preferences saved.");
  } catch {
    notify("Browser storage is unavailable. Preferences could not be saved.");
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id === "employeeSearch") {
    const position = event.target.selectionStart;
    state.query = event.target.value;
    state.pageNumber = 1;
    render();
    $("#employeeSearch").focus();
    $("#employeeSearch").setSelectionRange(position, position);
  }
  if (event.target.id === "globalSearch") {
    state.query = event.target.value;
    state.department = "";
    state.status = "";
    state.pageNumber = 1;
    if (state.page !== "employees") navigate("employees");
    else render();
  }
});
document.addEventListener("change", (event) => {
  const id = event.target.id;
  if (["departmentFilter", "statusFilter", "sortFilter"].includes(id)) {
    state[
      {
        departmentFilter: "department",
        statusFilter: "status",
        sortFilter: "sort",
      }[id]
    ] = event.target.value;
    state.pageNumber = 1;
    render();
  }
  if (id === "attendanceDate") {
    if (
      state.attendanceDirty &&
      !confirm("Discard unsaved attendance for this date?")
    ) {
      event.target.value = state.date;
      return;
    }
    if (!event.target.value || event.target.value > today()) {
      event.target.value = state.date;
      notify("Choose today or an earlier date.");
      return;
    }
    state.date = event.target.value;
    state.attendanceDirty = false;
    loadAttendance();
  }
  if (event.target.classList.contains("attendance-status")) {
    state.attendanceDirty = true;
    $("#attendanceSummary").textContent = "Unsaved changes";
  }
});
$("#menuToggle").onclick = () => {
  const open = $("#sidebar").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
};
document.addEventListener("click", (event) => {
  if (
    !event.target.closest(".sidebar") &&
    !event.target.closest("#menuToggle")
  ) {
    $("#sidebar").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
  }
});
$("#themeToggle").onclick = () => {
  preferences.theme = preferences.theme === "dark" ? "light" : "dark";
  try {
    savePreferences();
  } catch {
    applyPreferences();
  }
};
$("#logout").onclick = async () => {
  if (state.attendanceSaving) {
    notify("Please wait for attendance to finish saving.");
    return;
  }
  if (state.attendanceDirty && !confirm("Sign out without saving attendance?"))
    return;
  try {
    await api("/logout", { method: "POST" });
    state.attendanceDirty = false;
    location.href = "index.html";
  } catch (error) {
    notify(error.message);
  }
};
window.addEventListener("hashchange", () => navigate(location.hash.slice(1)));
window.addEventListener("beforeunload", (event) => {
  if (state.attendanceDirty) {
    event.preventDefault();
    event.returnValue = "";
  }
});
$("#footerDate").textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});
applyPreferences();
state.page = pageInfo[location.hash.slice(1)]
  ? location.hash.slice(1)
  : "dashboard";
render();
reload();
