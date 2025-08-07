'use client'

import { createGlobalStyle } from 'styled-components'
import React from "react";

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'IBM Plex Sans';
    src: url('/fonts/IBMPlexSans/IBMPlexSans-VariableFont_wdth,wght.ttf') format('truetype');
    font-weight: 100 900;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'IBM Plex Sans';
    src: url('/fonts/IBMPlexSans/IBMPlexSans-Italic-VariableFont_wdth,wght.ttf') format('truetype');
    font-weight: 100 900;
    font-style: italic;
    font-display: swap;
  }

  @font-face {
      font-family: 'CNBold';
      src: url('/fonts/CNBold/cn_bold.ttf') format('truetype');
      font-weight: 100 900;
      font-display: swap;
  }
`

export function FontProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            <GlobalStyles />
            {children}
        </>
    )
}