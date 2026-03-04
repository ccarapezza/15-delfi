const SHEET_NAME = "RSVP";
const ORGANIZER_EMAIL = "carapezza.christian@gmail.com,luxusfotografia@gmail.com,delfinavighi@gmail.com";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");

    // Honeypot anti-bots: si viene completo, lo descartamos
    if (payload.website && String(payload.website).trim() !== "") {
      return json({ status: "ignored" });
    }

    const nombre = cleanText(payload.nombre);
    const apellido = cleanText(payload.apellido);
    const celular = cleanText(payload.celular);
    const colectivo = payload.colectivo === true || payload.colectivo === "true" ? "SÍ" : "NO";
    const userAgent = cleanText(payload.userAgent);

    // Validaciones mínimas
    if (!nombre || nombre.length < 2) return jsonError("Nombre inválido");
    if (!apellido || apellido.length < 2) return jsonError("Apellido inválido");
    if (!celular || celular.length < 6) return jsonError("Celular inválido");

    // Guardar en Sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return jsonError(`No existe la pestaña ${SHEET_NAME}`);

    sheet.appendRow([
      new Date(),
      nombre,
      apellido,
      celular,
      colectivo,
      userAgent || ""
    ]);

    // Email al organizador (simple)
    MailApp.sendEmail({
      to: ORGANIZER_EMAIL,
      subject: `Nuevo RSVP: ${nombre} ${apellido}`,
      htmlBody: `
        <p><b>Nuevo RSVP</b></p>
        <ul>
          <li>Nombre: ${escapeHtml(nombre)}</li>
          <li>Apellido: ${escapeHtml(apellido)}</li>
          <li>Celular: ${escapeHtml(celular)}</li>
          <li>Colectivo: ${escapeHtml(colectivo)}</li>
        </ul>
      `
    });

    return json({ status: "ok" });
  } catch (err) {
    return jsonError("Error procesando la solicitud");
  }
}

function cleanText(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim().replace(/\s+/g, " ");
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError(message) {
  return json({ status: "error", message });
}

// Evita inyección boba en mail HTML
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}