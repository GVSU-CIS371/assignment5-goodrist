import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import bases from "../data/bases.json";
import syrups from "../data/syrups.json";
import creamers from "../data/creamers.json";
import db from "../firebase.ts";

import {
  collection,
  getDocs,
  setDoc,
  doc,
  QuerySnapshot,
  QueryDocumentSnapshot,
  onSnapshot,
  query,
  Unsubscribe,
} from "firebase/firestore";

import type { User } from "firebase/auth";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    // UI setup
    temps: tempretures,
    currentTemp: tempretures[0],

    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,

    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,

    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,

    // User beverages
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",

    // Authentication
    user: null as User | null,
    snapshotUnsubscribe: null as Unsubscribe | null,
  }),

  actions: {
    // ---------------------------
    // INITIAL BASE DATA
    // ---------------------------
    init() {
      // Bases
      const baseCollection = collection(db, "bases");
      getDocs(baseCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            bases.forEach((b) => {
              const base = doc(db, `bases/${b.id}`);
              setDoc(base, { name: b.name, color: b.color });
            });
            this.bases = bases;
          } else {
            this.bases = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as BaseBeverageType[];
          }
          this.currentBase = this.bases[0];
        })
        .catch(console.error);

      // Syrups
      const syrupCollection = collection(db, "syrups");
      getDocs(syrupCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            syrups.forEach((b) => {
              const syrup = doc(db, `syrups/${b.id}`);
              setDoc(syrup, { name: b.name, color: b.color });
            });
            this.syrups = syrups;
          } else {
            this.syrups = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as SyrupType[];
          }
          this.currentSyrup = this.syrups[0];
        })
        .catch(console.error);

      // Creamers
      const creamerCollection = collection(db, "creamers");
      getDocs(creamerCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            creamers.forEach((b) => {
              const creamer = doc(db, `creamers/${b.id}`);
              setDoc(creamer, { name: b.name, color: b.color });
            });
            this.creamers = creamers;
          } else {
            this.creamers = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as CreamerType[];
          }
          this.currentCreamer = this.creamers[0];
        })
        .catch(console.error);
    },

    // ---------------------------
    // SELECTING A SAVED BEVERAGE
    // ---------------------------
    showBeverage() {
      if (!this.currentBeverage) return;

      this.currentName = this.currentBeverage.name;
      this.currentTemp = this.currentBeverage.temp;
      this.currentBase = this.currentBeverage.base;
      this.currentSyrup = this.currentBeverage.syrup;
      this.currentCreamer = this.currentBeverage.creamer;
    },

    // ---------------------------
    // CREATE BEVERAGE
    // ---------------------------
    async makeBeverage(): Promise<string> {
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }

      if (
        !this.currentName ||
        !this.currentBase ||
        !this.currentSyrup ||
        !this.currentCreamer
      ) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      try {
        const beveragesCol = collection(
          db,
          "users",
          this.user.uid,
          "beverages"
        );

        const bevDocRef = doc(beveragesCol);
        const newBeverage: BeverageType = {
          id: bevDocRef.id,
          name: this.currentName.trim(),
          temp: this.currentTemp,
          base: this.currentBase,
          syrup: this.currentSyrup,
          creamer: this.currentCreamer,
        };

        await setDoc(bevDocRef, newBeverage);

        this.beverages.push(newBeverage);
        this.currentBeverage = newBeverage;

        return `Beverage ${newBeverage.name} made successfully!`;
      } catch (error) {
        console.error(error);
        return "There was an error making your beverage. Please try again.";
      }
    },

    // ---------------------------
    // AUTH STATE CHANGE LISTENER
    // ---------------------------
    setUser(user: User | null) {
      if (this.snapshotUnsubscribe) {
        this.snapshotUnsubscribe();
        this.snapshotUnsubscribe = null;
      }

      this.user = user;

      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        this.currentName = "";
        return;
      }

      const beveragesCol = collection(db, "users", user.uid, "beverages");
      const q = query(beveragesCol);

      this.snapshotUnsubscribe = onSnapshot(q, (qs) => {
        const oldId = this.currentBeverage?.id ?? null;

        this.beverages = qs.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name,
            temp: data.temp,
            base: data.base,
            syrup: data.syrup,
            creamer: data.creamer,
          } as BeverageType;
        });

        if (oldId) {
          this.currentBeverage =
            this.beverages.find((b) => b.id === oldId) || null;
        }

        if (!this.currentBeverage && this.beverages.length > 0) {
          this.currentBeverage = this.beverages[0];
        }
      });
    },
  },
});
