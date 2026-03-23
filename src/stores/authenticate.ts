import { defineStore } from "pinia";
import { useRouter } from "vue-router";

const apiBaseUrl: string = import.meta.env.VITE_RESTAPI_URL;

/** ---- Types ---- */
export interface User {
  user_id: number
  first_name: string
  last_name: string
  avatar: string
  role: string[]
}
interface AuthResponse {
  token: string;
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  roles: string[] | string;
  errors?: unknown;
}

interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  roles: string[] | string;
}

export const useAuthStore = defineStore("authStore", {
  state: (): {
    user: User;
    isVerified: boolean;
    token: string;
    isAuthenticated: boolean,
    loading: boolean,
  } => ({
    user: {
      user_id: 0,
      first_name: "",
      last_name: "",
      role: [],
      avatar: ""
    },
    isAuthenticated: false,
    isVerified: false,
    loading: true,
    token: localStorage.getItem("token") || "",
  }),

  actions: {
    /******************* Get authenticated user *******************/
    async getUser() {
      if (this.isVerified) return;

      if (!this.token) {
        this.isAuthenticated = false;
        this.isVerified = true;
        this.loading = false;
        return;
      }

      this.loading = true;

      try {
        const res = await fetch(`${apiBaseUrl}/api/user/verify-token`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json"
          }
        });


        if (!res.ok) throw new Error("Token invalid");

        const data: UserResponse = await res.json();

        this.user = {
          user_id : data.id,
          first_name : data.firstName,
          last_name : data.lastName,
          role : Array.isArray(data.roles) ? data.roles : [data.roles],
          avatar: data.avatar
        }
      
        this.isAuthenticated = true;
        this.isVerified = true;

        console.log("user fetched", data)
      } catch {
        await this.logout();
      } finally {
        this.loading = false;
      }
    },

    /******************* Login or Register user *******************/
    async authenticate(apiRoute: string, formData: { email: string; password: string }): Promise<AuthResponse> {
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
      this.isVerified = false;

      this.user = {
        user_id : data.id,
        first_name : data.firstName,
        last_name : data.lastName,
        role : Array.isArray(data.roles) ? data.roles : [data.roles],
        avatar: data.avatar
      }

      this.isAuthenticated = true;
      return data;
    }
    ,
    /******************* Logout user *******************/
    async logout(): Promise<boolean> {


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
          avatar:""
        };
        this.token = "";
        localStorage.removeItem("token");
        this.isVerified = false;
      }
       return true;
    },
  },
});
