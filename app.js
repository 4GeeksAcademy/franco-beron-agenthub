const navButtons = Array.from(document.querySelectorAll(".nav-link"));
const sectionTitle = document.getElementById("section-title");
const sections = Array.from(
  document.querySelectorAll("main > section.section-panel"),
);
const metricsGrid = document.getElementById("metrics-grid");
const weeklyActivityChart = document.getElementById("weekly-activity-chart");

const usersTableBody = document.querySelector("#users-table tbody");
const agentsTableBody = document.querySelector("#agents-table tbody");
const skillsTableBody = document.querySelector("#skills-table tbody");
const contractsTableBody = document.querySelector("#contracts-table tbody");
const errorsTableBody = document.querySelector("#errors-table tbody");

const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const topbarSearch = document.getElementById("topbar-search");

const themeToggle = document.getElementById("theme-toggle");

const modal = document.getElementById("modal-root");
const modalCard = modal.querySelector(".modal-card");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");

const confirmDialog = document.getElementById("confirm-dialog");
const confirmCard = confirmDialog.querySelector(".modal-card");
const confirmTitle = document.getElementById("confirm-title");
const confirmDescription = document.getElementById("confirm-description");
const confirmCancel = document.getElementById("confirm-cancel");
const confirmAccept = document.getElementById("confirm-accept");

const searchableTitle = {
  dashboard: "Dashboard",
  users: "Gestion de Usuarios",
  agents: "Gestion de Agentes",
  skills: "Skills",
  contracts: "Contrataciones",
  errors: "Log de Errores",
};

const dropdownRegistry = new Map();
const resolvedErrors = new Set();
let backdropNode = null;
let lastFocusedElement = null;
let confirmAction = null;

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function findSkillById(skillId) {
  return skillsData.find((skill) => skill.id === skillId);
}

function findAgentById(agentId) {
  return agentsData.find((agent) => agent.id === agentId);
}

function getStatusClass(status) {
  const normalized = status.toLowerCase();
  if (normalized === "activo") return "status-activo";
  if (normalized === "pendiente") return "status-pendiente";
  if (normalized === "suspendido") return "status-suspendido";
  if (normalized === "inactivo") return "status-inactivo";
  if (normalized === "fallando") return "status-fallando";
  return "status-pendiente";
}

function getSeverityClass(severity) {
  return `severity-${severity.toLowerCase()}`;
}

function createStatusPill(label) {
  return `<span class="status-pill ${getStatusClass(label)}">${label}</span>`;
}

function createSeverityPill(label) {
  return `<span class="severity-pill ${getSeverityClass(label)}" aria-label="Severidad ${label}">${label}</span>`;
}

function openSidebar() {
  if (!window.matchMedia("(max-width: 767px)").matches) return;
  sidebar.classList.add("open");
  openSidebarBtn.setAttribute("aria-expanded", "true");
  if (!backdropNode) {
    backdropNode = document.createElement("div");
    backdropNode.className = "backdrop-screen md:hidden";
    backdropNode.addEventListener("click", closeSidebar);
  }
  document.body.appendChild(backdropNode);
  updateBodyScrollLock();
}

function closeSidebar() {
  sidebar.classList.remove("open");
  openSidebarBtn.setAttribute("aria-expanded", "false");
  backdropNode?.remove();
  updateBodyScrollLock();
}

function applyTheme(themeValue) {
  const root = document.documentElement;
  const normalizedTheme = themeValue === "dark" ? "dark" : "light";
  const isDark = normalizedTheme === "dark";

  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", normalizedTheme);

  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
  );
  themeToggle.title = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  themeToggle.textContent = isDark ? "☀️" : "🌙";
}

function initializeTheme() {
  const stored = localStorage.getItem("agenthub-theme");
  if (stored === "dark" || stored === "light") {
    applyTheme(stored);
    return;
  }

  if (stored) {
    localStorage.removeItem("agenthub-theme");
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function switchTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const nextTheme = isDark ? "light" : "dark";
  localStorage.setItem("agenthub-theme", nextTheme);
  applyTheme(nextTheme);
}

function normalizeSearchValue(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getActiveSectionId() {
  const activeButton = navButtons.find(
    (button) => button.getAttribute("aria-current") === "page",
  );
  return activeButton?.dataset.section || "dashboard";
}

function getTableBodyBySection(sectionId) {
  const registry = {
    users: usersTableBody,
    agents: agentsTableBody,
    skills: skillsTableBody,
    contracts: contractsTableBody,
    errors: errorsTableBody,
  };
  return registry[sectionId] || null;
}

function resetTableFilters() {
  [
    usersTableBody,
    agentsTableBody,
    skillsTableBody,
    contractsTableBody,
    errorsTableBody,
  ].forEach((tbody) => {
    if (!tbody) return;
    Array.from(tbody.rows).forEach((row) => {
      row.hidden = false;
    });
  });
}

function hasMatchingRows(sectionId, query) {
  const tbody = getTableBodyBySection(sectionId);
  if (!tbody) return false;
  return Array.from(tbody.rows).some((row) =>
    normalizeSearchValue(row.textContent).includes(query),
  );
}

function filterRowsInSection(sectionId, query) {
  const tbody = getTableBodyBySection(sectionId);
  if (!tbody) return;
  Array.from(tbody.rows).forEach((row) => {
    const rowText = normalizeSearchValue(row.textContent);
    row.hidden = !rowText.includes(query);
  });
}

function runTopbarSearch(value) {
  const query = normalizeSearchValue(value);

  if (!query) {
    resetTableFilters();
    return;
  }

  const titleMatch = Object.entries(searchableTitle).find(([, title]) =>
    normalizeSearchValue(title).includes(query),
  );

  const rowMatch = titleMatch
    ? null
    : ["users", "agents", "skills", "contracts", "errors"].find((sectionId) =>
        hasMatchingRows(sectionId, query),
      );

  const targetSectionId = titleMatch?.[0] || rowMatch || getActiveSectionId();

  if (targetSectionId !== getActiveSectionId()) {
    activateSection(targetSectionId);
  }

  resetTableFilters();
  filterRowsInSection(targetSectionId, query);
}

function activateSection(sectionId) {
  sections.forEach((section) => {
    const isTarget = section.id === sectionId;
    section.classList.toggle("hidden", !isTarget);
  });

  navButtons.forEach((button) => {
    const isActive = button.dataset.section === sectionId;
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  sectionTitle.textContent = searchableTitle[sectionId] || "Dashboard";

  if (window.matchMedia("(max-width: 767px)").matches) {
    closeSidebar();
  }

  if (topbarSearch && topbarSearch.value.trim()) {
    runTopbarSearch(topbarSearch.value);
  }
}

function renderMetrics() {
  const activeAgents = agentsData.filter(
    (agent) => agent.status === "Activo",
  ).length;
  const failingAgents = agentsData.filter(
    (agent) => agent.status === "Fallando",
  ).length;

  const cards = [
    {
      title: "Ingresos del Mes",
      value: "$124.500",
      description: "Facturacion total estimada del periodo.",
    },
    {
      title: "Perdidas por Descuentos",
      value: "$8.240",
      description: "Impacto acumulado por ajustes comerciales.",
    },
    {
      title: "Agentes Activos",
      value: activeAgents.toLocaleString("es-AR"),
      description: "Agentes operando con estado estable.",
    },
    {
      title: "Agentes Fallando",
      value: failingAgents.toLocaleString("es-AR"),
      description: "Agentes con incidentes abiertos.",
    },
  ];

  metricsGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card" aria-label="${card.title}">
          <p class="text-sm text-[var(--muted)]">${card.title}</p>
          <strong>${card.value}</strong>
          <p class="mt-2 text-sm text-[var(--muted)]">${card.description}</p>
        </article>
      `,
    )
    .join("");
}

function getWeeklyActivityData() {
  const labels = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const activeAgents = agentsData.filter(
    (agent) => agent.status === "Activo",
  ).length;
  const errorsWeight = errorsData.length;

  return labels.map((label, index) => {
    const dailyLoad =
      68 + activeAgents * 5 + ((index * 7 + errorsWeight) % 15) + index * 3;
    return { label, dailyLoad };
  });
}

function renderWeeklyActivity() {
  if (!weeklyActivityChart) return;

  const weeklyData = getWeeklyActivityData();
  const maxLoad = Math.max(...weeklyData.map((item) => item.dailyLoad));
  const minLoad = Math.min(...weeklyData.map((item) => item.dailyLoad));
  const avgLoad = Math.round(
    weeklyData.reduce((acc, item) => acc + item.dailyLoad, 0) /
      weeklyData.length,
  );

  const bars = weeklyData
    .map((item) => {
      const height = Math.max(22, Math.round((item.dailyLoad / maxLoad) * 180));
      return `
        <div class="weekly-activity-col" aria-label="${item.label}: ${item.dailyLoad} ejecuciones">
          <span class="weekly-activity-value">${item.dailyLoad}</span>
          <div class="weekly-activity-bar" style="height:${height}px" aria-hidden="true"></div>
          <span class="weekly-activity-label">${item.label}</span>
        </div>
      `;
    })
    .join("");

  weeklyActivityChart.classList.add("is-active-chart");
  weeklyActivityChart.setAttribute(
    "aria-label",
    "Grafico de barras con actividad semanal por dia",
  );
  weeklyActivityChart.innerHTML = `
    <div class="weekly-activity-grid">${bars}</div>
    <p class="weekly-activity-summary">
      Promedio diario: <strong>${avgLoad}</strong> ejecuciones · Rango semanal: <strong>${minLoad} - ${maxLoad}</strong>
    </p>
  `;
}

function formatSkillList(skillIds) {
  return skillIds
    .map((skillId) => findSkillById(skillId)?.name || skillId)
    .join(", ");
}

function openModal({ title, description, contentHtml }, opener) {
  lastFocusedElement = opener || document.activeElement;
  modalTitle.textContent = title;
  modalDescription.textContent = description;
  modalContent.innerHTML = contentHtml;
  modal.showModal();
  updateBodyScrollLock();
  modalCard.focus();
}

function closeModal() {
  modal.close();
  modalContent.innerHTML = "";
  updateBodyScrollLock();
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function openConfirm({ title, description, onAccept }, opener) {
  lastFocusedElement = opener || document.activeElement;
  confirmAction = onAccept;
  confirmTitle.textContent = title;
  confirmDescription.textContent = description;
  confirmDialog.showModal();
  updateBodyScrollLock();
  confirmCard.focus();
}

function closeConfirm() {
  confirmDialog.close();
  confirmAction = null;
  updateBodyScrollLock();
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function updateBodyScrollLock() {
  const shouldLock =
    modal.open || confirmDialog.open || sidebar.classList.contains("open");
  document.body.classList.toggle("modal-open", shouldLock);
}

function trapFocus(event, container) {
  if (event.key !== "Tab") return;

  const focusable = Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((node) => !node.hasAttribute("disabled"));

  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function createActionMenu(options) {
  const wrap = document.createElement("div");
  wrap.className = "action-wrap";

  const button = document.createElement("button");
  const menu = document.createElement("div");

  const menuId = `menu-${Math.random().toString(36).slice(2, 9)}`;
  button.type = "button";
  button.className = "btn-plain";
  button.textContent = "Acciones";
  button.setAttribute("aria-haspopup", "menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", menuId);

  menu.className = "dropdown-menu hidden";
  menu.id = menuId;
  menu.setAttribute("role", "menu");

  options.forEach((option, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "dropdown-item";
    item.setAttribute("role", "menuitem");
    item.textContent = option.label;
    item.dataset.index = String(index);
    item.addEventListener("click", () => {
      closeAllDropdowns();
      option.onSelect(item);
    });
    menu.appendChild(item);
  });

  function openMenu(focusFirst = false) {
    closeAllDropdowns();
    button.setAttribute("aria-expanded", "true");
    menu.classList.remove("hidden");
    if (focusFirst) {
      const firstItem = menu.querySelector(".dropdown-item");
      firstItem?.focus();
    }
  }

  function closeMenu() {
    button.setAttribute("aria-expanded", "false");
    menu.classList.add("hidden");
  }

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
      return;
    }
    openMenu(false);
  });

  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu(true);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(true);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(true);
      const items = menu.querySelectorAll(".dropdown-item");
      items[items.length - 1]?.focus();
    }
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  menu.addEventListener("keydown", (event) => {
    const items = Array.from(menu.querySelectorAll(".dropdown-item"));
    const currentIndex = items.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1 + items.length) % items.length;
      items[nextIndex]?.focus();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (currentIndex - 1 + items.length) % items.length;
      items[nextIndex]?.focus();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      button.focus();
    }
  });

  dropdownRegistry.set(menuId, { wrap, button, menu, closeMenu });

  wrap.appendChild(button);
  wrap.appendChild(menu);
  return wrap;
}

function closeAllDropdowns() {
  dropdownRegistry.forEach(({ closeMenu }) => closeMenu());
}

function openUserDetails(user, opener) {
  openModal(
    {
      title: `Detalle de usuario: ${user.name}`,
      description: "Informacion administrativa del usuario seleccionado.",
      contentHtml: `
        <div class="modal-grid">
          <div><h4>Nombre</h4><p>${user.name}</p></div>
          <div><h4>Email</h4><p>${user.email}</p></div>
          <div><h4>Empresa</h4><p>${user.company}</p></div>
          <div><h4>Plan contratado</h4><p>${user.plan}</p></div>
          <div><h4>Fecha de registro</h4><p>${user.registerDate}</p></div>
          <div><h4>Ultimo acceso</h4><p>${user.lastAccess}</p></div>
          <div><h4>Cantidad de agentes asociados</h4><p>${user.agentsAssociated}</p></div>
        </div>
      `,
    },
    opener,
  );
}

function openAgentConfig(agent, opener) {
  const skillOptions = skillsData
    .map(
      (skill) => `
        <label class="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm">
          <input type="checkbox" name="skills" value="${skill.id}" ${agent.skills.includes(skill.id) ? "checked" : ""} />
          <span>${skill.name}</span>
        </label>
      `,
    )
    .join("");

  openModal(
    {
      title: `Configuracion de agente: ${agent.name}`,
      description:
        "Actualiza datos visuales del agente y registra los cambios.",
      contentHtml: `
        <form id="agent-config-form" class="modal-grid">
          <div>
            <h4>Nombre del agente</h4>
            <input
              name="name"
              type="text"
              value="${agent.name}"
              class="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <h4>Prompt del sistema</h4>
            <textarea
              name="systemPrompt"
              rows="5"
              class="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm"
              readonly
              aria-readonly="true"
            >${agent.systemPrompt}</textarea>
          </div>
          <div>
            <h4>Skills asociadas</h4>
            <div class="mt-2 grid gap-2 md:grid-cols-2">${skillOptions}</div>
          </div>
          <p id="agent-config-feedback" class="hidden rounded-lg border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-sm text-[var(--muted)]" aria-live="polite"></p>
          <div class="flex flex-wrap justify-end gap-3">
            <button type="button" class="btn-secondary" id="agent-config-cancel">Cancelar</button>
            <button type="submit" class="btn-plain">Registrar cambios</button>
          </div>
        </form>
      `,
    },
    opener,
  );

  const form = document.getElementById("agent-config-form");
  const cancelBtn = document.getElementById("agent-config-cancel");
  const feedback = document.getElementById("agent-config-feedback");

  cancelBtn?.addEventListener("click", closeModal);
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const nextName = String(formData.get("name") || "").trim();
    const nextSkills = formData
      .getAll("skills")
      .map((value) => String(value))
      .filter(Boolean);

    if (!nextName || nextSkills.length === 0) {
      if (feedback) {
        feedback.textContent =
          "Completa nombre y al menos una skill para registrar.";
        feedback.classList.remove("hidden");
      }
      return;
    }

    agent.name = nextName;
    agent.skills = nextSkills;

    renderAgents();

    if (feedback) {
      feedback.textContent = "Cambios registrados correctamente.";
      feedback.classList.remove("hidden");
    }

    setTimeout(() => {
      closeModal();
    }, 220);
  });
}

function openSkillDetails(skill, opener) {
  openModal(
    {
      title: `Detalle de skill: ${skill.name}`,
      description: "Informacion completa sobre la habilidad seleccionada.",
      contentHtml: `
        <div class="modal-grid">
          <div><h4>Nombre</h4><p>${skill.name}</p></div>
          <div><h4>Descripcion completa</h4><p>${skill.description}</p></div>
          <div><h4>Casos de uso</h4><p>${skill.useCases}</p></div>
          <div><h4>Cantidad de agentes asociados</h4><p>${skill.agentsCount}</p></div>
        </div>
      `,
    },
    opener,
  );
}

function openContractDetails(contract, opener) {
  const agent = findAgentById(contract.agentId);
  const rows = contract.skills
    .map((skillId) => {
      const skill = findSkillById(skillId);
      return `<tr><td>${skill?.name || skillId}</td><td>${currencyFormatter.format(skill?.price || 0)}</td></tr>`;
    })
    .join("");

  const total = contract.skills.reduce((acc, skillId) => {
    const skill = findSkillById(skillId);
    return acc + (skill?.price || 0);
  }, 0);

  openModal(
    {
      title: `Contrato ${contract.id.toUpperCase()}`,
      description: "Detalle de contratacion del agente y skills asociadas.",
      contentHtml: `
        <div class="modal-grid">
          <div><h4>Informacion del Cliente</h4><p>${contract.client}</p></div>
          <div><h4>Informacion del Agente</h4><p>${agent?.name || "No disponible"}</p></div>
          <div><h4>Fechas</h4><p>Inicio: ${contract.startDate} · Fin: ${contract.endDate}</p></div>
          <div>
            <h4>Desglose de Skills</h4>
            <table class="table-base">
              <caption class="sr-only">Desglose de skills del contrato</caption>
              <thead><tr><th scope="col">Skill</th><th scope="col">Precio</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <p class="mt-3"><strong>Total: ${currencyFormatter.format(total)}</strong></p>
          </div>
        </div>
      `,
    },
    opener,
  );
}

function openErrorDetails(errorRecord, opener) {
  const agent = findAgentById(errorRecord.agentId);
  openModal(
    {
      title: `Detalle de error ${errorRecord.id.toUpperCase()}`,
      description: "Informacion tecnica del incidente registrado.",
      contentHtml: `
        <div class="modal-grid">
          <div><h4>Mensaje completo</h4><pre>${errorRecord.message}</pre></div>
          <div><h4>Stack trace</h4><pre>${errorRecord.stackTrace}</pre></div>
          <div><h4>Agente afectado</h4><p>${agent?.name || errorRecord.agentId}</p></div>
          <div><h4>Fecha</h4><p>${errorRecord.dateTime}</p></div>
          <div><h4>Metadatos asociados</h4><pre>${errorRecord.metadata}</pre></div>
        </div>
      `,
    },
    opener,
  );
}

function askDelete(entityLabel, opener) {
  openConfirm(
    {
      title: `Eliminar ${entityLabel}`,
      description:
        "Esta accion no realiza eliminacion real. Solo confirma visualmente el flujo.",
      onAccept: () => {
        closeConfirm();
      },
    },
    opener,
  );
}

function renderUsers() {
  usersTableBody.innerHTML = "";
  usersData.forEach((user) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.plan}</td>
      <td>${createStatusPill(user.status)}</td>
      <td></td>
    `;

    const actionCell = row.lastElementChild;
    const menu = createActionMenu([
      {
        label: "Ver detalle",
        onSelect: (opener) => openUserDetails(user, opener),
      },
      {
        label: "Eliminar",
        onSelect: (opener) => askDelete(`usuario ${user.name}`, opener),
      },
    ]);
    actionCell.appendChild(menu);
    usersTableBody.appendChild(row);
  });
}

function renderAgents() {
  agentsTableBody.innerHTML = "";
  agentsData.forEach((agent) => {
    const row = document.createElement("tr");

    const skillNames = agent.skills.map(
      (skillId) => findSkillById(skillId)?.name || skillId,
    );
    const skillItems = skillNames.map((item) => `<li>${item}</li>`).join("");

    row.innerHTML = `
      <td>${agent.name}</td>
      <td>${agent.owner}</td>
      <td>${createStatusPill(agent.status)}</td>
      <td>
        <details class="skill-details">
          <summary aria-expanded="false">Ver skills (${skillNames.length})</summary>
          <div class="skills-list" role="region" aria-label="Lista de skills asociadas a ${agent.name}">
            <ul class="mt-2 list-disc pl-5 text-sm text-[var(--muted)]">${skillItems}</ul>
          </div>
        </details>
      </td>
      <td></td>
    `;

    const summary = row.querySelector("summary");
    const details = row.querySelector("details");
    details.addEventListener("toggle", () => {
      summary.setAttribute("aria-expanded", String(details.open));
    });

    const actionCell = row.lastElementChild;
    const menu = createActionMenu([
      {
        label: "Configurar",
        onSelect: (opener) => openAgentConfig(agent, opener),
      },
      {
        label: "Eliminar",
        onSelect: (opener) => askDelete(`agente ${agent.name}`, opener),
      },
    ]);

    actionCell.appendChild(menu);
    agentsTableBody.appendChild(row);
  });
}

function renderSkills() {
  skillsTableBody.innerHTML = "";

  skillsData.forEach((skill) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${skill.name}</td>
      <td>${skill.description}</td>
      <td>${skill.agentsCount}</td>
      <td></td>
    `;

    const actionCell = row.lastElementChild;
    const menu = createActionMenu([
      {
        label: "Ver detalle",
        onSelect: (opener) => openSkillDetails(skill, opener),
      },
      {
        label: "Eliminar",
        onSelect: (opener) => askDelete(`skill ${skill.name}`, opener),
      },
    ]);

    actionCell.appendChild(menu);
    skillsTableBody.appendChild(row);
  });
}

function contractTotal(contract) {
  return contract.skills.reduce((acc, skillId) => {
    const skill = findSkillById(skillId);
    return acc + (skill?.price || 0);
  }, 0);
}

function renderContracts() {
  contractsTableBody.innerHTML = "";

  contractsData.forEach((contract) => {
    const agent = findAgentById(contract.agentId);
    const skillsText = formatSkillList(contract.skills);
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${contract.client}</td>
      <td>${agent?.name || contract.agentId}</td>
      <td>${skillsText}</td>
      <td>${contract.startDate}</td>
      <td>${contract.endDate}</td>
      <td>${currencyFormatter.format(contractTotal(contract))}</td>
      <td></td>
    `;

    const actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "btn-plain";
    actionButton.textContent = "Ver detalle";
    actionButton.addEventListener("click", () =>
      openContractDetails(contract, actionButton),
    );
    row.lastElementChild.appendChild(actionButton);
    contractsTableBody.appendChild(row);
  });
}

function renderErrors() {
  errorsTableBody.innerHTML = "";

  errorsData.forEach((errorRecord) => {
    const agent = findAgentById(errorRecord.agentId);
    const isResolved = resolvedErrors.has(errorRecord.id);
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${errorRecord.dateTime}</td>
      <td>${agent?.name || errorRecord.agentId}</td>
      <td>${createSeverityPill(errorRecord.severity)}</td>
      <td>${errorRecord.summary}${isResolved ? ' <span class="status-pill status-activo">Resuelto</span>' : ""}</td>
      <td></td>
    `;

    const actionCell = row.lastElementChild;
    const menu = createActionMenu([
      {
        label: "Ver detalle",
        onSelect: (opener) => openErrorDetails(errorRecord, opener),
      },
      {
        label: "Marcar como resuelto",
        onSelect: () => {
          resolvedErrors.add(errorRecord.id);
          renderErrors();
        },
      },
    ]);

    actionCell.appendChild(menu);
    errorsTableBody.appendChild(row);
  });
}

function initializeTablesAndCards() {
  renderMetrics();
  renderWeeklyActivity();
  renderUsers();
  renderAgents();
  renderSkills();
  renderContracts();
  renderErrors();
}

function initializeNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () =>
      activateSection(button.dataset.section),
    );
  });
}

function setupDialogBehavior() {
  modalClose.addEventListener("click", closeModal);
  confirmCancel.addEventListener("click", closeConfirm);
  modal.addEventListener("close", updateBodyScrollLock);
  confirmDialog.addEventListener("close", updateBodyScrollLock);

  confirmAccept.addEventListener("click", () => {
    if (typeof confirmAction === "function") {
      confirmAction();
    }
    closeConfirm();
  });

  [
    { dialog: modal, card: modalCard, closeFn: closeModal },
    { dialog: confirmDialog, card: confirmCard, closeFn: closeConfirm },
  ].forEach(({ dialog, card, closeFn }) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeFn();
      }
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFn();
      }
      trapFocus(event, card);
    });
  });
}

function setupGlobalInteractions() {
  document.addEventListener("click", (event) => {
    const clickedInsideMenu = Array.from(dropdownRegistry.values()).some(
      ({ wrap }) => wrap.contains(event.target),
    );
    if (!clickedInsideMenu) {
      closeAllDropdowns();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllDropdowns();
      if (sidebar.classList.contains("open")) {
        closeSidebar();
        openSidebarBtn.focus();
      }
    }
  });
}

function init() {
  initializeTheme();
  initializeNavigation();
  initializeTablesAndCards();
  setupDialogBehavior();
  setupGlobalInteractions();

  activateSection("dashboard");

  themeToggle.addEventListener("click", switchTheme);
  topbarSearch?.addEventListener("input", (event) => {
    runTopbarSearch(event.target.value);
  });
  openSidebarBtn.addEventListener("click", openSidebar);
  closeSidebarBtn.addEventListener("click", closeSidebar);
}

init();
