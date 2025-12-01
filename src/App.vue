<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />

    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`r${temp}`"
              :value="temp"
              v-model="beverageStore.currentTemp"
              :disabled="!beverageStore.user"
            />
            {{ temp }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="b in beverageStore.bases" :key="b.id">
          <label>
            <input
              type="radio"
              name="bases"
              :id="`r${b.id}`"
              :value="b"
              v-model="beverageStore.currentBase"
              :disabled="!beverageStore.user"
            />
            {{ b.name }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="s in beverageStore.syrups" :key="s.id">
          <label>
            <input
              type="radio"
              name="syrups"
              :id="`r${s.id}`"
              :value="s"
              v-model="beverageStore.currentSyrup"
              :disabled="!beverageStore.user"
            />
            {{ s.name }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="c in beverageStore.creamers" :key="c.id">
          <label>
            <input
              type="radio"
              name="creamers"
              :id="`r${c.id}`"
              :value="c"
              v-model="beverageStore.currentCreamer"
              :disabled="!beverageStore.user"
            />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>

    <!-- AUTH -->
    <div class="auth-row">
      <button v-if="!beverageStore.user" @click="withGoogle">
        Sign in with Google
      </button>

      <div v-else class="user-label">
        Signed in as: <strong>{{ beverageStore.user.email }}</strong>
      </div>

      <button v-if="beverageStore.user" @click="logout">
        Sign Out
      </button>
    </div>

    <input
      v-model="beverageStore.currentName"
      type="text"
      placeholder="Beverage Name"
      :disabled="!beverageStore.user"
    />

    <button @click="handleMakeBeverage" :disabled="!beverageStore.user">
      🍺 Make Beverage
    </button>

    <p v-if="message" class="status-message">
      {{ message }}
    </p>
  </div>

  <div v-if="beverageStore.user" style="margin-top: 20px">
    <template v-for="bev in beverageStore.beverages" :key="bev.id">
      <input
        type="radio"
        :id="bev.id"
        :value="bev"
        v-model="beverageStore.currentBeverage"
        @change="beverageStore.showBeverage()"
      />
      <label :for="bev.id">{{ bev.name }}</label>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

const beverageStore = useBeverageStore();
beverageStore.init();

const message = ref("");

const showMessage = (txt: string) => {
  message.value = txt;
  setTimeout(() => {
    message.value = "";
  }, 5000);
};

const withGoogle = async () => {
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    beverageStore.setUser(result.user);
    showMessage("Signed in successfully!");
  } catch (e: any) {
    showMessage("Login failed: " + e.message);
  }
};

const logout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    beverageStore.setUser(null);
    showMessage("Signed out.");
  } catch (e: any) {
    showMessage("Logout failed: " + e.message);
  }
};

const handleMakeBeverage = async () => {
  const txt = await beverageStore.makeBeverage();
  showMessage(txt);
};
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}

ul {
  list-style: none;
}

.auth-row {
  margin-top: 10px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-label {
  color: #ffffff;
  font-size: 0.9rem;
}

.status-message {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  font-size: 0.9rem;
}
</style>
