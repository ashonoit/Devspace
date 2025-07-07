import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { Archive } from "lucide-react"

interface User {
  username: string
  userId: string
  email: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  authenticated: boolean
}

const initialState: AuthState = {  //initially user info will be null
  user: null,
  loading: true,
  error: null,
  authenticated:false
}

// -------------------- ASYNC THUNKS --------------------

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    {username, email,password}: { username: string; email: string; password: string },thunkAPI) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URI!}/api/auth/signup`, {
        username,
        email,
        password,
      },
      {withCredentials:true}      
      )
      return res.data.user as User
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Signup failed")
    }
  }
)


// Sign in with credentials
export const signin = createAsyncThunk(
  "auth/signin",
  async ({ username, password }: { username: string; password: string }, thunkAPI) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URI!}/api/auth/signin`, 
        { username, password },
        {withCredentials:true}
      )
      return res.data.user as User  //return user info
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Signin failed")
    }
  }
)

// Sign in with Google
export const signinWithGoogle = createAsyncThunk("auth/signinWithGoogle",
    async ({ code }: { code: string }, thunkAPI) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URI!}/api/auth/viaGoogle`, { code }, {withCredentials:true})
      return res.data.user as User
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Google signin failed")
    }
  }
)

// Sign out
export const signout = createAsyncThunk(`auth/signout`, async (_, thunkAPI) => {
  try {
    await axios.post(`${import.meta.env.VITE_SERVER_URI!}/api/auth/signout`,{}, {withCredentials:true})
    return null
  } catch (err: any) {
    return thunkAPI.rejectWithValue("Signout failed")
  }
})

// Load user on app start
export const loadUser = createAsyncThunk("auth/loadUser", async (_, thunkAPI) => {
  try {
    // console.log("loading user...")
    const res = await axios.get(`${import.meta.env.VITE_SERVER_URI!}/api/auth/me`, 
        {withCredentials:true}
    )
    // console.log(res.data.user)
    
    return res.data.user as User
  } catch {
    return thunkAPI.rejectWithValue("Loading user failed") // no user is okay
  }
})

// -------------------- SLICE --------------------

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {},

  extraReducers: builder => {
    builder
        .addCase(signup.pending, state => {
          state.loading = true
          state.error = null
          state.authenticated=false
        })
        .addCase(signup.fulfilled, (state, action) => {
          state.loading = false
          state.user = action.payload
          state.authenticated=false
          
        })
        .addCase(signup.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload as string
          state.authenticated=false
        })
        .addCase(signin.pending, state => {
          state.loading = true
          state.error = null
          state.authenticated = false
        })
        .addCase(signin.fulfilled, (state, action) => {
          state.loading = false
          state.user = action.payload
          state.authenticated = true
        })
        .addCase(signin.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload as string
          state.authenticated = false
        })

        .addCase(signinWithGoogle.pending, state => {
          state.loading = true
          state.error = null
          state.authenticated = false
        })
        .addCase(signinWithGoogle.fulfilled, (state, action) => {
          state.loading = false
          state.user = action.payload
          state.authenticated = true;
        })
        .addCase(signinWithGoogle.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload as string
          state.authenticated = false
        })

        .addCase(signout.fulfilled, state => {
          state.user = null
          state.loading = false
          state.error = null
          state.authenticated = false
        })

        .addCase(loadUser.pending, (state) => {
          state.loading = true
          state.error = null
          state.authenticated = false
        })
        .addCase(loadUser.fulfilled, (state, action) => {
          state.user = action.payload
        //   console.log(action.payload)
          state.loading = false
          state.authenticated = true;
        })
        .addCase(loadUser.rejected, state => {
          state.user = null;
          state.authenticated = false;
          state.loading = false;
        })
  },
})

export default authSlice.reducer
