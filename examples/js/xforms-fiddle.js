(function () {
  const DEFAULT_XFORMS_SOURCE = `<?xml version="1.0" encoding="UTF-8"?>
<xf:xform
  xmlns:xf="http://www.w3.org/2002/xforms"
  xmlns:ev="http://www.w3.org/2001/xml-events">
  <xf:model id="demo-model">
    <xf:instance id="demo-data">
      <data xmlns="">
        <name>World</name>
      </data>
    </xf:instance>
  </xf:model>

  <div id="fiddle-demo">
    <h2>Simple form</h2>
    <xf:input ref="instance('demo-data')/name">
      <xf:label>Name</xf:label>
    </xf:input>
    <p>Hello, <xf:output ref="instance('demo-data')/name"/></p>
  </div>
</xf:xform>`;

  const consoleElement = document.getElementById("fiddle-console");
  const xsltElement = document.getElementById("xslt-source");
  const xformsEditor = document.getElementById("xforms-source-editor");
  const xformsHighlight = document.getElementById("xforms-source-highlight");
  const refreshButton = document.getElementById("refresh-xforms");
  const renderedContainer = document.getElementById("xForm");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightAttributes(value) {
    return value.replace(
      /([\w:.-]+)(=)(&quot;[^&]*&quot;|'[^']*')/g,
      '<span class="xml-attr-name">$1</span><span class="xml-punctuation">$2</span><span class="xml-attr-value">$3</span>'
    );
  }

  function renderXml(xmlText) {
    let highlighted = escapeHtml(xmlText || "");
    highlighted = highlighted.replace(
      /(&lt;\?[\s\S]*?\?&gt;)/g,
      '<span class="xml-prolog">$1</span>'
    );
    highlighted = highlighted.replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="xml-comment">$1</span>'
    );
    highlighted = highlighted.replace(
      /(&lt;\/?)([\w:.-]+)([\s\S]*?)(\/?&gt;)/g,
      function (_match, open, name, attrs, close) {
        return [
          `<span class="xml-punctuation">${open}</span>`,
          `<span class="xml-tag-name">${name}</span>`,
          highlightAttributes(attrs),
          `<span class="xml-punctuation">${close}</span>`
        ].join("");
      }
    );
    return highlighted;
  }

  function setEditorValue(value) {
    xformsEditor.value = value;
    renderEditorXml();
    syncEditorScroll();
  }

  function renderEditorXml() {
    xformsHighlight.innerHTML = `${renderXml(xformsEditor.value)}\n`;
  }

  function syncEditorScroll() {
    xformsHighlight.scrollTop = xformsEditor.scrollTop;
    xformsHighlight.scrollLeft = xformsEditor.scrollLeft;
  }

  function formatLogArgument(value) {
    if (value instanceof Error) {
      return value.stack || value.message;
    }
    if (typeof value === "object" && value !== null) {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  function appendConsoleLine(level, args) {
    const line = document.createElement("div");
    line.className = `console-line level-${level}`;
    line.textContent = `[${level}] ${args.map(formatLogArgument).join(" ")}`;
    consoleElement.appendChild(line);
    consoleElement.scrollTop = consoleElement.scrollHeight;
  }

  function clearConsole() {
    consoleElement.textContent = "";
  }

  function installConsoleCapture() {
    if (window.__xformsFiddleConsoleCaptureInstalled) {
      return;
    }
    window.__xformsFiddleConsoleCaptureInstalled = true;
    const methods = ["log", "info", "warn", "error"];
    methods.forEach(function (method) {
      const original = console[method].bind(console);
      console[method] = function (...args) {
        appendConsoleLine(method, args);
        original(...args);
      };
    });
    window.addEventListener("error", function (event) {
      appendConsoleLine("error", [event.message || "Unhandled error"]);
    });
    window.addEventListener("unhandledrejection", function (event) {
      appendConsoleLine("error", [event.reason || "Unhandled promise rejection"]);
    });
  }

  async function loadXsltSource() {
    try {
      const response = await fetch("/src/saxon-xforms.xsl");
      if (!response.ok) {
        throw new Error(`Unable to load XSLT source (${response.status}).`);
      }
      const sourceText = await response.text();
      xsltElement.innerHTML = renderXml(sourceText);
    } catch (error) {
      xsltElement.textContent = `Unable to load XSLT source: ${error instanceof Error ? error.message : String(error)}`;
      appendConsoleLine("error", [error]);
    }
  }

  function parseXforms(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      throw new Error(parseError.textContent || "Invalid XML.");
    }
    return doc;
  }

  async function refreshXForms() {
    clearConsole();
    appendConsoleLine("info", ["Refreshing XForms…"]);
    renderedContainer.innerHTML = "";
    try {
      const xformsDoc = parseXforms(xformsEditor.value);
      await SaxonJS.transform(
        {
          stylesheetLocation: "/sef/saxon-xforms.sef.json",
          sourceNode: xformsDoc
        },
        "async"
      );
      appendConsoleLine("info", ["Render complete."]);
    } catch (error) {
      appendConsoleLine("error", [error]);
    }
  }

  async function initialize() {
    installConsoleCapture();
    setEditorValue(DEFAULT_XFORMS_SOURCE);
    xformsEditor.addEventListener("input", renderEditorXml);
    xformsEditor.addEventListener("scroll", syncEditorScroll);
    xformsEditor.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void refreshXForms();
      }
    });
    refreshButton.addEventListener("click", function () {
      void refreshXForms();
    });
    await loadXsltSource();
    await refreshXForms();
  }

  window.addEventListener("DOMContentLoaded", function () {
    void initialize();
  });
})();
