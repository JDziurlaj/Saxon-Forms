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

  const SAXONFORMS_SOURCE_URL = "/src/saxon-xforms.xsl";
  const PRECOMPILED_STYLESHEET_LOCATION = "/sef/saxon-xforms.sef.json";
  const PRECOMPILED_STYLESHEET_SOURCE = "precompiled";
  const COMPILED_STYLESHEET_SOURCE = "compiled";
  const COMPILED_STYLESHEET_TRANSFORM_EXPRESSION = "transform(map { 'stylesheet-text': $stylesheetText, 'source-node': parse-xml($sourceText), 'stylesheet-base-uri': $stylesheetBaseUri })";

  const consoleElement = document.getElementById("fiddle-console");
  const saxonFormsEditor = document.getElementById("saxonforms-source-editor");
  const saxonFormsHighlight = document.getElementById("saxonforms-source-highlight");
  const xformsEditor = document.getElementById("xforms-source-editor");
  const xformsHighlight = document.getElementById("xforms-source-highlight");
  const stylesheetSourceSelect = document.getElementById("stylesheet-source-select");
  const compileButton = document.getElementById("compile-saxonforms");
  const refreshButton = document.getElementById("refresh-xforms");
  const renderedContainer = document.getElementById("xForm");
  const compiledSourceOption = stylesheetSourceSelect.querySelector(`option[value="${COMPILED_STYLESHEET_SOURCE}"]`);
  const busyIndicator = document.getElementById("fiddle-busy-indicator");
  const busyText = document.getElementById("fiddle-busy-text");

  let compiledSaxonFormsSourceText = null;
  let compiledSaxonFormsVersion = 0;
  let busyOperationCount = 0;

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

  function renderEditorXml(editor, highlight) {
    highlight.innerHTML = `${renderXml(editor.value)}\n`;
  }

  function syncEditorScroll(editor, highlight) {
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  }

  function setEditorValue(editor, highlight, value) {
    editor.value = value;
    renderEditorXml(editor, highlight);
    syncEditorScroll(editor, highlight);
  }

  function wireXmlEditor(editor, highlight) {
    editor.addEventListener("input", function () {
      renderEditorXml(editor, highlight);
    });
    editor.addEventListener("scroll", function () {
      syncEditorScroll(editor, highlight);
    });
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

  function parseXml(xmlText, label) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      const parseMessage = (parseError.textContent || "Invalid XML.")
        .replace(/\s+/g, " ")
        .trim();
      throw new Error(`${label} is not well-formed XML: ${parseMessage}`);
    }
    return doc;
  }

  function getSelectedStylesheetSource() {
    return stylesheetSourceSelect.value || PRECOMPILED_STYLESHEET_SOURCE;
  }

  function setControlsDisabled(isDisabled) {
    compileButton.disabled = isDisabled;
    refreshButton.disabled = isDisabled;
    stylesheetSourceSelect.disabled = isDisabled;
  }

  function showBusyIndicator(message) {
    busyOperationCount += 1;
    busyText.textContent = message;
    busyIndicator.hidden = false;
    document.body.classList.add("fiddle-busy");
    document.body.setAttribute("aria-busy", "true");
    setControlsDisabled(true);
  }

  function hideBusyIndicator() {
    busyOperationCount = Math.max(0, busyOperationCount - 1);
    if (busyOperationCount > 0) {
      return;
    }
    busyIndicator.hidden = true;
    busyText.textContent = "Processing…";
    document.body.classList.remove("fiddle-busy");
    document.body.removeAttribute("aria-busy");
    setControlsDisabled(false);
  }

  function waitForPaint() {
    return new Promise((resolve) => {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => setTimeout(resolve, 0));
        return;
      }
      setTimeout(resolve, 0);
    });
  }

  async function runWithBusyIndicator(message, task) {
    showBusyIndicator(message);
    await waitForPaint();
    try {
      return await task();
    } finally {
      hideBusyIndicator();
    }
  }

  function getSaxonFormsBaseUri() {
    return new URL(SAXONFORMS_SOURCE_URL, window.location.href).toString();
  }

  function ensureCompiledModeAvailable() {
    if (!SaxonJS || !SaxonJS.XPath || typeof SaxonJS.XPath.evaluate !== "function") {
      throw new Error("Compiled source mode requires SaxonJS.XPath.evaluate, which is unavailable in this build.");
    }
  }

  function runCompiledSourceTransform(stylesheetText, sourceText) {
    ensureCompiledModeAvailable();
    return SaxonJS.XPath.evaluate(
      COMPILED_STYLESHEET_TRANSFORM_EXPRESSION,
      [],
      {
        params: {
          stylesheetText,
          sourceText,
          stylesheetBaseUri: getSaxonFormsBaseUri(),
        },
      }
    );
  }

  function getCompiledTransformResultEntries(transformResult) {
    if (!transformResult || typeof transformResult !== "object") {
      return [];
    }
    return Object.entries(transformResult).filter(function ([key]) {
      return key !== "messages";
    });
  }

  function getCompiledTransformOutput(transformResult) {
    const resultEntries = getCompiledTransformResultEntries(transformResult);
    if (resultEntries.length === 0) {
      return null;
    }
    const targetFragment = `#${renderedContainer.id}`;
    const exactTargetEntry = resultEntries.find(function ([key]) {
      return key === targetFragment;
    });
    if (exactTargetEntry) {
      return exactTargetEntry[1];
    }
    const matchingTargetEntry = resultEntries.find(function ([key]) {
      return key.endsWith(targetFragment) || key.includes(targetFragment);
    });
    if (matchingTargetEntry) {
      return matchingTargetEntry[1];
    }
    const principalOutputEntry = resultEntries.find(function ([key]) {
      return key === "output";
    });
    if (principalOutputEntry) {
      return principalOutputEntry[1];
    }
    return resultEntries[0][1];
  }

  function appendCompiledTransformMarkup(fragment, markup) {
    if (typeof markup !== "string" || markup.trim() === "") {
      return 0;
    }
    const template = document.createElement("template");
    template.innerHTML = markup;
    const renderedNode = template.content.querySelector(`#${renderedContainer.id}`);
    const nodesToAppend = renderedNode ? Array.from(renderedNode.childNodes) : Array.from(template.content.childNodes);
    nodesToAppend.forEach(function (node) {
      fragment.appendChild(node.cloneNode(true));
    });
    return nodesToAppend.length;
  }

  function appendCompiledTransformNode(fragment, outputNode) {
    if (!(outputNode instanceof Node)) {
      return 0;
    }
    if (outputNode.nodeType === Node.ELEMENT_NODE && outputNode.id === renderedContainer.id) {
      const elementChildren = Array.from(outputNode.childNodes);
      elementChildren.forEach(function (node) {
        fragment.appendChild(node.cloneNode(true));
      });
      return elementChildren.length;
    }
    if (outputNode.nodeType === Node.DOCUMENT_NODE) {
      const documentNode = outputNode;
      if (documentNode.documentElement && documentNode.documentElement.id === renderedContainer.id) {
        const documentChildren = Array.from(documentNode.documentElement.childNodes);
        documentChildren.forEach(function (node) {
          fragment.appendChild(node.cloneNode(true));
        });
        return documentChildren.length;
      }
      if (documentNode.body) {
        const bodyChildren = Array.from(documentNode.body.childNodes);
        bodyChildren.forEach(function (node) {
          fragment.appendChild(node.cloneNode(true));
        });
        return bodyChildren.length;
      }
      const topLevelNodes = Array.from(documentNode.childNodes);
      topLevelNodes.forEach(function (node) {
        fragment.appendChild(node.cloneNode(true));
      });
      return topLevelNodes.length;
    }
    if (outputNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      const renderedNode = typeof outputNode.querySelector === "function"
        ? outputNode.querySelector(`#${renderedContainer.id}`)
        : null;
      const fragmentNodes = renderedNode
        ? Array.from(renderedNode.childNodes)
        : Array.from(outputNode.childNodes);
      fragmentNodes.forEach(function (node) {
        fragment.appendChild(node.cloneNode(true));
      });
      return fragmentNodes.length;
    }
    fragment.appendChild(outputNode.cloneNode(true));
    return 1;
  }

  function appendCompiledTransformValue(fragment, outputValue) {
    if (outputValue == null) {
      return 0;
    }
    if (Array.isArray(outputValue)) {
      return outputValue.reduce(function (count, value) {
        return count + appendCompiledTransformValue(fragment, value);
      }, 0);
    }
    if (typeof outputValue === "string") {
      return appendCompiledTransformMarkup(fragment, outputValue);
    }
    if (outputValue instanceof Node) {
      return appendCompiledTransformNode(fragment, outputValue);
    }
    if (typeof outputValue === "object") {
      return Object.values(outputValue).reduce(function (count, value) {
        return count + appendCompiledTransformValue(fragment, value);
      }, 0);
    }
    return 0;
  }

  function applyCompiledTransformOutput(transformResult) {
    const transformOutput = getCompiledTransformOutput(transformResult);
    const outputFragment = document.createDocumentFragment();
    const appendedNodeCount = appendCompiledTransformValue(outputFragment, transformOutput);
    if (appendedNodeCount === 0) {
      throw new Error("Compiled source render produced no output for #xForm.");
    }
    renderedContainer.innerHTML = "";
    renderedContainer.appendChild(outputFragment);
  }

  function normalizeStylesheetTextForBrowserCompilation(stylesheetText) {
    return stylesheetText.replace(
      /starts-with\(normalize-space\(\$response\),'<'\)/g,
      "starts-with(normalize-space($response),'&lt;')"
    );
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

  async function loadSaxonFormsSource() {
    try {
      const response = await fetch(SAXONFORMS_SOURCE_URL);
      if (!response.ok) {
        throw new Error(`Unable to load XSLT source (${response.status}).`);
      }
      const sourceText = await response.text();
      setEditorValue(saxonFormsEditor, saxonFormsHighlight, sourceText);
    } catch (error) {
      setEditorValue(
        saxonFormsEditor,
        saxonFormsHighlight,
        `<!-- Unable to load SaxonForms source: ${error instanceof Error ? error.message : String(error)} -->`
      );
      appendConsoleLine("error", [error]);
    }
  }

  async function compileSaxonFormsSource() {
    appendConsoleLine("info", ["Compiling SaxonForms source…"]);
    try {
      await runWithBusyIndicator(
        "Compiling SaxonForms source… this may take a while.",
        async function () {
          ensureCompiledModeAvailable();
          parseXml(xformsEditor.value, "XForms source");

          const sourceSnapshot = normalizeStylesheetTextForBrowserCompilation(saxonFormsEditor.value);
          const xformsSnapshot = xformsEditor.value;
          await Promise.resolve(runCompiledSourceTransform(sourceSnapshot, xformsSnapshot));

          compiledSaxonFormsSourceText = sourceSnapshot;
          compiledSaxonFormsVersion += 1;
          if (compiledSourceOption) {
            compiledSourceOption.disabled = false;
            compiledSourceOption.textContent = `Compiled from editor (v${compiledSaxonFormsVersion})`;
          }
          stylesheetSourceSelect.value = COMPILED_STYLESHEET_SOURCE;
        }
      );
      appendConsoleLine("info", [`Compile complete. Using compiled source v${compiledSaxonFormsVersion}.`]);
    } catch (error) {
      appendConsoleLine("error", [error]);
    }
  }

  async function refreshXForms() {
    clearConsole();
    const selectedStylesheetSource = getSelectedStylesheetSource();
    appendConsoleLine(
      "info",
      [
        selectedStylesheetSource === COMPILED_STYLESHEET_SOURCE
          ? "Refreshing XForms with compiled SaxonForms source…"
          : "Refreshing XForms with precompiled SEF…"
      ]
    );

    renderedContainer.innerHTML = "";
    try {
      await runWithBusyIndicator(
        selectedStylesheetSource === COMPILED_STYLESHEET_SOURCE
          ? "Rendering with compiled source… this may take a while."
          : "Refreshing XForms…",
        async function () {
          const xformsSource = xformsEditor.value;
          const xformsDoc = parseXml(xformsSource, "XForms source");
          if (selectedStylesheetSource === COMPILED_STYLESHEET_SOURCE) {
            if (!compiledSaxonFormsSourceText) {
              throw new Error("No compiled SaxonForms source is available. Click \"Compile SaxonForms\" first.");
            }
            const transformResult = await Promise.resolve(runCompiledSourceTransform(compiledSaxonFormsSourceText, xformsSource));
            applyCompiledTransformOutput(transformResult);
          } else {
            await SaxonJS.transform(
              {
                stylesheetLocation: PRECOMPILED_STYLESHEET_LOCATION,
                sourceNode: xformsDoc
              },
              "async"
            );
          }
        }
      );
      appendConsoleLine("info", ["Render complete."]);
    } catch (error) {
      appendConsoleLine("error", [error]);
    }
  }

  async function initialize() {
    installConsoleCapture();
    setEditorValue(xformsEditor, xformsHighlight, DEFAULT_XFORMS_SOURCE);
    wireXmlEditor(saxonFormsEditor, saxonFormsHighlight);
    wireXmlEditor(xformsEditor, xformsHighlight);

    saxonFormsEditor.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void compileSaxonFormsSource();
      }
    });

    xformsEditor.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void refreshXForms();
      }
    });

    compileButton.addEventListener("click", function () {
      void compileSaxonFormsSource();
    });

    stylesheetSourceSelect.addEventListener("change", function () {
      if (getSelectedStylesheetSource() === COMPILED_STYLESHEET_SOURCE && !compiledSaxonFormsSourceText) {
        appendConsoleLine("warn", ["Compiled source is not available yet. Using precompiled SEF instead."]);
        stylesheetSourceSelect.value = PRECOMPILED_STYLESHEET_SOURCE;
        return;
      }
      appendConsoleLine(
        "info",
        [
          getSelectedStylesheetSource() === COMPILED_STYLESHEET_SOURCE
            ? "Selected compiled SaxonForms source."
            : "Selected precompiled SaxonForms SEF."
        ]
      );
    });

    refreshButton.addEventListener("click", function () {
      void refreshXForms();
    });

    await loadSaxonFormsSource();
    await refreshXForms();
  }

  window.addEventListener("DOMContentLoaded", function () {
    void initialize();
  });
})();