# SPECS.md

# Panel de Administración AgentHub

# 1. Descripción General del Proyecto

## Producto

AgentHub es una plataforma SaaS que permite a empresas alquilar Agentes de IA configurables mediante Skills (habilidades) especializadas.

El panel de administración es una herramienta interna utilizada por el equipo operativo de AgentHub para:

* Supervisar la actividad de la plataforma.
* Gestionar usuarios.
* Gestionar agentes.
* Gestionar skills.
* Revisar contrataciones activas e históricas.
* Monitorear errores de ejecución.

Este entregable corresponde a un prototipo frontend completamente funcional a nivel visual utilizando datos simulados.

No se requiere integración con backend.

---

# 2. Objetivos Principales

El prototipo debe:

* Representar completamente los flujos administrativos definidos.
* Utilizar HTML semántico como prioridad principal.
* Cumplir con WCAG 2.2 nivel AA.
* Ser navegable completamente mediante teclado.
* Soportar modo claro y oscuro.
* Adaptarse a dispositivos móviles, tabletas y escritorio.
* Poder ser implementado por cualquier desarrollador sin necesidad de aclaraciones adicionales.

---

# 3. Restricciones Técnicas

## Tecnologías

* HTML5
* Tailwind CSS
* JavaScript Vanilla

## Tecnologías No Permitidas

* React
* Vue
* Angular
* jQuery
* Bootstrap
* Frameworks UI externos

## Fuente de Datos

Todos los datos deben provenir de arrays JavaScript simulados.

No se realizarán llamadas a APIs.

No se implementará persistencia.

---

# 4. Política "HTML Semántico Primero"

La semántica HTML tiene prioridad sobre la apariencia visual.

Deben utilizarse siempre que corresponda:

* header
* nav
* aside
* main
* section
* article
* footer
* table
* caption
* thead
* tbody
* dialog
* button
* details
* summary

El uso de div debe limitarse únicamente a casos donde no exista una alternativa semántica adecuada.

---

# 5. Requisitos de Accesibilidad

Objetivo:

Cumplimiento WCAG 2.2 AA.

Requisitos obligatorios:

* Navegación completa mediante teclado.
* Compatibilidad con lectores de pantalla.
* Estados de foco claramente visibles.
* Estructura jerárquica correcta de encabezados.
* Landmarks semánticos correctamente definidos.
* Contraste adecuado en modo claro y oscuro.
* Soporte para usuarios con reducción de movimiento.
* Uso correcto de atributos ARIA cuando corresponda.

Objetivos Lighthouse:

* Accessibility ≥ 95
* Best Practices ≥ 90
* SEO ≥ 90

---

# 6. Arquitectura General de la Aplicación

## Estructura Semántica Global

```html
<body>

<header>

<aside>
<nav>

<main>

<section>

<footer>

</body>
```

## Layout General

### Sidebar

Ubicación:

* Lateral izquierda.

Función:

* Navegación principal.

### Topbar

Ubicación:

* Parte superior del contenido principal.

Función:

* Contexto de la sección actual.
* Toggle de modo oscuro.

### Área Principal

Función:

* Renderizar la sección activa.

---

# 7. Estrategia de Encabezados

Debe existir un único H1 en toda la aplicación.

## H1

AgentHub - Panel de Administración

## H2

* Dashboard
* Gestión de Usuarios
* Gestión de Agentes
* Skills
* Contrataciones
* Log de Errores

No se permiten saltos jerárquicos.

---

# 8. Navegación

## Menú Lateral

Opciones:

* Dashboard
* Gestión de Usuarios
* Gestión de Agentes
* Skills
* Contrataciones
* Log de Errores

### Accesibilidad

La sección activa deberá utilizar:

```html
aria-current="page"
```

### Responsive

#### Desktop

Sidebar fija.

#### Mobile

Sidebar colapsable tipo drawer.

---

# 9. Barra Superior

Elementos:

* Nombre de la sección actual.
* Campo de búsqueda visual (placeholder).
* Toggle modo claro / oscuro.

## Toggle Tema

Debe ser un botón accesible.

Atributos:

```html
aria-label
aria-pressed
```

Persistencia:

localStorage.

---

# 10. Sistema de Diseño

## Bordes

rounded-lg

## Sombras

shadow-sm

shadow-md

## Espaciado

Sistema basado en múltiplos de 8px.

## Tipografía

Stack del sistema operativo.

---

# 11. Dashboard

## Objetivo

Presentar indicadores clave de la plataforma.

## Tarjetas de Métricas

Deben existir cuatro tarjetas.

### Ingresos del Mes

Ejemplo:

$124.500

### Pérdidas por Descuentos

Ejemplo:

$8.240

### Agentes Activos

Ejemplo:

1.482

### Agentes Fallando

Ejemplo:

12

---

## Actividad Semanal

Debajo de las métricas debe existir una sección para gráfico de actividad.

No se requiere gráfico funcional.

Debe existir un placeholder visual.

Altura mínima:

320px.

---

# 12. Gestión de Usuarios

## Tabla de Usuarios

Columnas:

* Nombre
* Email
* Plan
* Estado
* Acciones

La tabla debe incluir:

```html
<table>
<caption>
<thead>
<tbody>
```

---

## Estados

* Activo
* Suspendido
* Pendiente

Los estados no deben diferenciarse únicamente por color.

---

## Menú de Acciones

Opciones:

* Ver detalle
* Eliminar

---

## Modal de Detalle

Información mostrada:

* Nombre
* Email
* Empresa
* Plan contratado
* Fecha de registro
* Último acceso
* Cantidad de agentes asociados

---

## Eliminación

Debe mostrarse un diálogo de confirmación.

No se elimina realmente ningún registro.

---

# 13. Gestión de Agentes

## Información Mostrada

* Nombre del agente
* Propietario
* Estado
* Skills asociadas
* Acciones

---

## Estados

* Activo
* Inactivo
* Fallando

---

## Skills Colapsables

Las skills deben permanecer ocultas inicialmente.

Al expandir:

* Mostrar listado completo.
* Animación suave.
* Duración máxima 200 ms.

Accesibilidad:

```html
aria-expanded
```

---

## Modal de Configuración

Debe mostrar:

* Nombre del agente.
* Prompt del sistema.
* Skills asociadas.

El prompt debe mostrarse en modo solo lectura.

---

## Acciones

* Configurar
* Eliminar

---

# 14. Skills

## Objetivo

Mostrar el catálogo de habilidades disponibles.

---

## Texto Explicativo

Debe incluirse un bloque informativo:

"Una Skill es una capacidad reutilizable que puede asignarse a uno o más agentes de IA. Permite extender sus funcionalidades para realizar tareas específicas como navegación web, gestión de calendarios o análisis documental."

---

## Información por Skill

* Nombre
* Descripción
* Cantidad de agentes que la utilizan

---

## Acciones

* Ver detalle
* Eliminar

---

## Modal de Detalle

Mostrar:

* Nombre
* Descripción completa
* Casos de uso
* Cantidad de agentes asociados

---

# 15. Contrataciones de Agentes

## Tabla

Columnas:

* Cliente
* Agente
* Skills contratadas
* Fecha inicio
* Fecha fin
* Importe total
* Acciones

---

## Modal de Contrato

Debe mostrar:

### Información del Cliente

### Información del Agente

### Fechas

### Desglose de Skills

Ejemplo:

| Skill               | Precio |
| ------------------- | ------ |
| Navegación Web      | $20    |
| Calendario          | $10    |
| Análisis Documental | $15    |

Total:

$45

---

## Acciones

* Ver detalle

---

# 16. Log de Errores

## Objetivo

Monitorear problemas de ejecución.

---

## Tabla

Columnas:

* Fecha y hora
* Agente
* Severidad
* Resumen
* Acciones

---

## Severidades

* INFO
* WARNING
* ERROR
* CRITICAL

Cada severidad debe combinar:

* Texto
* Color
* Iconografía opcional

Nunca depender únicamente del color.

---

## Modal de Error

Debe mostrar:

* Mensaje completo
* Stack trace
* Agente afectado
* Fecha
* Metadatos asociados

---

## Acciones

* Ver detalle
* Marcar como resuelto

---

# 17. Estándar de Modales

Todos los modales deben implementar:

```html
role="dialog"
aria-modal="true"
aria-labelledby=""
aria-describedby=""
```

Deben soportar:

* Cierre mediante botón.
* Cierre mediante Escape.
* Cierre mediante backdrop.
* Focus trap.

Al cerrarse:

* El foco vuelve al elemento que abrió el modal.

---

# 18. Estándar de Dropdowns

Deben utilizar:

```html
aria-haspopup="menu"
aria-expanded
```

Navegación mediante:

* Enter
* Espacio
* Flecha arriba
* Flecha abajo
* Escape

---

# 19. Responsive Design

## Mobile

0px - 767px

* Sidebar tipo drawer.
* Tablas con scroll horizontal.
* Tarjetas apiladas verticalmente.

## Tablet

768px - 1023px

* Sidebar reducida.
* Métricas en dos columnas.

## Desktop

1024px+

* Sidebar fija.
* Métricas en cuatro columnas.

---

# 20. Modo Oscuro

Implementación mediante clases dark: de Tailwind.

Requisitos:

* Persistencia mediante localStorage.
* Respeto por prefers-color-scheme.
* Contraste WCAG AA.
* Estados de foco visibles.

---

# 21. Datos Simulados

## Usuarios

Mínimo:

8 registros.

## Agentes

Mínimo:

10 registros.

## Skills

Mínimo:

8 registros.

Ejemplos:

* Navegación Web
* Gestión de Calendario
* Sincronización CRM
* Redacción de Emails
* Análisis Documental
* Calificación de Leads
* Extracción de Datos
* Reporting

## Contratos

Mínimo:

10 registros.

## Errores

Mínimo:

15 registros.

Deben existir errores de todas las severidades.

---

# 22. Estructura de Archivos

```text
/
│
├── index.html
├── styles.css
├── app.js
├── data.js
│
├── assets/
│   ├── icons/
│   └── images/
```

---

# 23. Arquitectura del DOM

```html
<body>

<header>

<aside>
<nav>

<main>

<section id="dashboard">

<section id="users">

<section id="agents">

<section id="skills">

<section id="contracts">

<section id="errors">

</main>

<footer>

</body>
```

El orden visual nunca debe romper el orden lógico de lectura para lectores de pantalla.

---

# 24. Definición de Terminado (Definition of Done)

La implementación se considera finalizada cuando:

✓ Existen las seis secciones requeridas.

✓ La navegación funciona correctamente.

✓ Todos los modales son accesibles.

✓ Todos los dropdowns son accesibles.

✓ El modo oscuro funciona correctamente.

✓ La aplicación es navegable sin mouse.

✓ Los lectores de pantalla pueden interpretar la estructura.

✓ Todas las tablas son semánticas.

✓ La jerarquía de encabezados es válida.

✓ El diseño es responsive.

✓ Los datos simulados se visualizan correctamente.

✓ Se cumplen los requisitos WCAG 2.2 AA.

✓ Accessibility Lighthouse ≥ 95.

✓ Best Practices Lighthouse ≥ 90.

✓ SEO Lighthouse ≥ 90.

---

# 25. Supuestos

1. El sistema es exclusivamente de uso interno.

2. La autenticación no forma parte del alcance.

3. La persistencia de datos no forma parte del alcance.

4. Las acciones de eliminación son únicamente visuales.

5. El gráfico del Dashboard es un placeholder.

6. No existe integración con backend.

7. Todos los datos utilizados son simulados.

8. El diseño debe asemejarse a una aplicación SaaS B2B moderna.

9. La accesibilidad y la semántica HTML tienen prioridad sobre cualquier decisión visual.
