<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<style scoped>
.hello {
  padding: 2rem;
}

h2 {
  color: hsla(160, 100%, 37%, 1);
  margin-bottom: 1rem;
}

p {
  color: var(--color-text);
  margin: 0.5rem 0;
}
</style>