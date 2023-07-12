<script>
</script>

<template>
  <img src="/icon-128.png" height="64" width="64" />
  <h1 class="title-1">Welcome to Cosmos Documentation</h1>
  <p>
    This is the internal documentation site for
    <a
      href="http://github.com/leapwallet/leap-cosmos/tree/main/packages/wallet-sdk"
      target="_blank"
      rel="noopener noreferrer"
      >@leapwallet/cosmos-wallet-sdk
    </a>
    and
    <a
      href="http://github.com/leapwallet/leap-cosmos/tree/main/packages/wallet-hooks"
      target="_blank"
      rel="noopener noreferrer"
      >@leapwallet/cosmos-wallet-hooks
    </a>
  </p>
  <p class="title-2">Quick Links</p>
  <div class="links-grid">
    <a href="./sdk/" class="links-grid__link">Wallet SDK</a>
    <a href="./hooks/" class="links-grid__link">Wallet Hooks</a>
  </div>
  <div>
    <p>To search the documentation, press <kbd class="kbd">⌘ K</kbd></p>
  </div>
</template>

<style scoped>
.title-1 {
  margin-top: 3rem;
}
.title-2 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1.5rem;
}
.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.links-grid__link {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  border: 1px solid #494949;
  border-radius: 1rem;
  transition: all 200ms linear;
}
.links-grid__link:hover {
  border: 1px solid var(--vp-c-brand);
}
.kbd {
  padding: 0.25rem 0.5rem;
  font-weight: bold;
  border: 1px solid #494949;
  border-radius: 0.25rem;
  /* give a bottom shadow */
  box-shadow: 0 4px 0 -0 black;
}
</style>
