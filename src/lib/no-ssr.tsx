// Source - https://stackoverflow.com/a
// Posted by Erik Hofer, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-09, License - CC BY-SA 4.0

// components/NoSsr.jsx
'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const NoSsr = (props: { children: React.ReactNode | React.ReactNode[] }) => (
  <React.Fragment>{props.children}</React.Fragment>
)

export default dynamic(() => Promise.resolve(NoSsr), {
  ssr: false
})
