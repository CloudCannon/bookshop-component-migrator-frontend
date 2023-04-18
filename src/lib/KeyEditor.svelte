<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let key = "";
    export let value = "";
    export let label = 'Label';

    const updateInput = (e) => {
        dispatch("change", {
            key: e.target.value 
        });
    }
</script>

<div>
    <label for={key}>{label}</label>
    <input 
      id={key}
      value={value} 
      on:input={updateInput} />
</div>

<style>
    div {
        padding: 10px;
        border: 2px solid #eee;
        border-radius: 8px;
        margin-bottom: 10px;
    }

    p {
        margin: 0;
    }

    label {
        font-weight: bold;
    }

    input {
        width: 100%;
    }
</style>
