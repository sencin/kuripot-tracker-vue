import { defineStore } from "pinia";
import { useRouter } from "vue-router";

const apiBaseUrl: string = import.meta.env.VITE_RESTAPI_URL;

/** ---- Types ---- */
export interface User {
  user_id: number
  first_name: string
  last_name: string
  role: string[]
}
interface AuthResponse {
  token: string;
  id: number;
  firstName: string;
  lastName: string;
  roles: string[] | string;
  errors?: unknown;
}

interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  roles: string[] | string;
}

export const useAuthStore = defineStore("authStore", {
  state: (): {
    user: User;
    loadingUser: boolean;
    token: string;
    isAuthenticated: boolean,
  } => ({
    user: {
      user_id: 0,
      first_name: "",
      last_name: "",
      role: [],
    },
    loadingUser: true,
    isAuthenticated: false,
    token: localStorage.getItem("token") || "",
  }),

  actions: {
    /******************* Get authenticated user *******************/
    async getUser(): Promise<void> {
      const router = useRouter();
      const token = this.token;

      if (!token) {
        this.loadingUser = false;
        console.log("No token available. Cancelling Fetching User");
        router.push({ name: "login" });
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/api/user/verify-token`, {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          this.loadingUser = false;
          await router.push({ name: "login" });
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch user data: ${res.status}`);
        }

        const data: UserResponse = await res.json();

        this.user.user_id = data.id;
        this.user.first_name = data.firstName;
        this.user.last_name = data.lastName;
        this.user.role = Array.isArray(data.roles) ? data.roles : [data.roles];
        this.isAuthenticated = true;

      } catch (error) {
        console.error("Unexpected error fetching user:", error);
        this.user = {
          user_id: 0,
          first_name: "",
          last_name: "",
          role: [],
        };
      } finally {
        this.loadingUser = false;
      }
    },

    /******************* Login or Register user *******************/
    async authenticate(
      apiRoute: string,
      formData: { email: string; password: string } // explicit type instead of unknown
    ): Promise<AuthResponse> {          // return the response instead of pushing
      const res = await fetch(`${apiBaseUrl}/api/auth/${apiRoute}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data: AuthResponse = await res.json();

      if (data.errors) {
        throw { response: { data } };
      }

      this.token = data.token;
      localStorage.setItem("token", data.token);

      this.user.user_id = data.id;
      this.user.first_name = data.firstName;
      this.user.last_name = data.lastName;
      this.user.role = Array.isArray(data.roles) ? data.roles : [data.roles];
      this.isAuthenticated = true;
      return data;
    }
    ,
    /******************* Logout user *******************/
    async logout(): Promise<void> {
      const router = useRouter();

      const res = await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "post",
        credentials: "include",
        headers: {
          authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data: { message?: string } = await res.json();
      console.log(data.message);

      if (res.ok) {
        this.user = {
          user_id: 0,
          first_name: "",
          last_name: "",
          role: [],
        };
        this.token = "";
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    },
  },
});
