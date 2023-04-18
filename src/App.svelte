<script>
  import { onMount } from "svelte";
  import componentMigrator from "bookshop-component-migrator";
  import yaml from 'js-yaml';

  import Editor from "./lib/Editor.svelte";
  import KeyEditor from "./lib/KeyEditor.svelte";

  export let version = "unknown";

  let templateEngineNames = Object.keys(componentMigrator.templateEngines);
  let selectedTemplateEngineName = templateEngineNames[0];
  let inputHtml = `<div>\n\t<p>Enter your html here</p>\n</div>`;
  let inputKeys = [];
  let inputLabel = 'unknown';
  let error = null;

  let parsed = {};
  let rendered = {};

  const updateInputHtml = (event) => {
    inputHtml = event.detail.code;
    parseInputHTML();
  };

  const updateInputKey = (newKey, index) => {
    inputKeys[index] = newKey;
    rerunTemplateEngine();
  };

  const updateLabel = (label) => {
    inputLabel = label;
    rerunTemplateEngine();
  };

  const parseInputHTML = () => {
    const fragment = document.createRange().createContextualFragment(inputHtml);
    let elementCount = 0;
    fragment.childNodes.forEach((node) => {
      if (!node.nodeName.startsWith('#')) {
        elementCount += 1;
      }
    });

    if (elementCount > 1) {
      error = 'Too many element nodes';
      return;
    }

    error = null;
    const el = fragment.children[0];
    parsed = componentMigrator.parseComponent(el);
    rerunTemplateEngine();

    inputKeys = Object.keys(rendered.keyToIdLookup).map((key) => {
      const newKey = rendered.keyToIdLookup[key];
      return newKey;
    });
  }

  const generateKeyLookup = () => {
    const dataKeys = Object.keys(parsed.data);
    const keyLookup = {};

    for (let i = 0; i < dataKeys.length; i++) {
      const dataKey = dataKeys[i];
      const inputKey = inputKeys[i];
      if (inputKey) {
        keyLookup[dataKey] = inputKey;
      }
    }

    return keyLookup;
  }

  const rerunTemplateEngine = () => {
    const TemplateEngineClass = componentMigrator.templateEngines[selectedTemplateEngineName];
    const templateEngine = new TemplateEngineClass(inputLabel || parsed.id, parsed.component, parsed.data);

    const keyLookup = generateKeyLookup();
    rendered = templateEngine.render(keyLookup);
  }

  const stringifyData = (data) => yaml.dump(data);

  onMount(() => {
    if (inputHtml) {
      parseInputHTML();
    }
  });
</script>

<main>
  <div class="forehead">
    <p>
      Component migrator version: <code
        >{version.startsWith("file") ? "Unreleased" : version}</code
      >
    </p>

    <label for="import">Template Engine:</label>
    <select
      id="import"
      bind:value={selectedTemplateEngineName}
      on:change={() => rerunTemplateEngine()}
    >
      {#each templateEngineNames as pack}
        <option value={pack}>
          {pack}
        </option>
      {/each}
    </select>
  </div>
  <div class="row">
    <div class="box">
      <p class="label">Input HTML</p>
      <Editor
        lang="html"
        code={inputHtml}
        error={error}
        on:newcode={updateInputHtml}
      />
    </div>
    <div class="box">
      <p class="label">Configure your component</p>
      <KeyEditor
        key={'Label'}
        value={inputLabel}
        label={'Component Name'}
        on:change={(e) => updateLabel(e.detail.key)} />
      {#each Object.keys(parsed.data || {}) as key, index}
        <KeyEditor
          key={key}
          value={inputKeys[index]}
          label={`${parsed.data[key].type}: ${parsed.data[key].value}`}
          on:change={(e) => updateInputKey(e.detail.key, index)} />
      {/each}
    </div>
  </div>
  <div class="row">
    <div class="box">
      <p class="label">Bookshop config</p>
      <Editor
        lang="yaml"
        code={stringifyData(rendered?.bookshop || 'Pending...')}
      />
    </div>
    <div class="box">
      <p class="label">Component HTML</p>
      <Editor
        lang="html"
        code={rendered?.component || 'Pending...'}
      />
    </div>
    <div class="box">
      <p class="label">Data</p>
      <Editor
        lang="yaml"
        code={stringifyData(rendered?.data || 'Pending...')}
      />
    </div>
  </div>
</main>
