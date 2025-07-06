import { createSlice } from '@reduxjs/toolkit'
// import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface ThemeState {
  mode: string
}

//fetch initial theme from local storage, if not local storage, from browser mode
const getInitialTheme = (): string => {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || stored === "light") return stored
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

//add or remove "dark" from html's class 
function updateHtmlClass(mode: string) {
  if (mode === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

// Define the initial state using that type
const initialState: ThemeState = {
  mode: getInitialTheme(),
}

export const themeSlice = createSlice({
  name: 'theme',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark"
      localStorage.setItem("theme", state.mode)
      updateHtmlClass(state.mode)
    }

    // // Use the PayloadAction type to declare the contents of `action.payload`
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.value += action.payload
    // },
  },
})

export const { toggleTheme} = themeSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectTheme = (state: RootState) => state.theme

export default themeSlice.reducer