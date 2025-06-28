<script lang="ts">
  import LoginForm from '$lib/components/LoginForm.svelte';
</script>

<svelte:head>
  <title>ログイン - Apps Script Hub</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Apps Script Hub</h1>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <LoginForm />
  </div>
</div>
