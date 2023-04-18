<script>
    import { EditorView, basicSetup } from "codemirror";
    import { EditorState, Compartment } from "@codemirror/state";
    import { keymap } from "@codemirror/view";
    import { StreamLanguage } from "@codemirror/language";
    import { yaml } from "@codemirror/legacy-modes/mode/yaml";
    import { html } from "@codemirror/lang-html";
    import { onMount, createEventDispatcher } from "svelte";
    import { tabBinding } from "./helpers";
    
    export let code = "";
    export let lang = "";
    export let error = false;

    const dispatch = createEventDispatcher();

    let editor, view, prevCode;
    let language = new Compartment();

    let extensions = [basicSetup, keymap.of([tabBinding])];
    switch (lang) {
        case "yaml":
            extensions.push(StreamLanguage.define(yaml));
            break;
        case "markdown":
            extensions.push(language.of(markdown()));
            break;
        case "html":
            extensions.push(language.of(html()));
            break;
        case "json":
            extensions.push(language.of(json()));
            break;
    }

    $: if (view) initState(code);

    const initState = (str) => {
        if (str !== prevCode) {
            view.setState(
                EditorState.create({
                    doc: code,
                    extensions,
                })
            );
            prevCode = str;
        }
    };

    const updateCode = (tx) => {
        view.update([tx]);
        if (tx.docChanged) {
            prevCode = view.state.doc.toString();
            dispatch("newcode", {
                code: prevCode,
                lang,
            });
        }
    };

    onMount(() => {
        view = new EditorView({
            parent: editor,
            dispatch: updateCode,
        });
        initState(code);
    });
</script>

<div class="editor" class:error bind:this={editor} />

<style>
    .editor {
        flex: 1;
    }
    :global(.editor :where(.cm-editor, .cm-gutters, .cm-content)) {
        /* min-height: 300px !important;
        height: 100vh !important; */
        height: 100%;
    }
    :global(.error .cm-gutters) {
        background-color: #ffb0b0 !important;
    }
</style>
