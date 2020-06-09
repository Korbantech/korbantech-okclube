import React from 'react'

import styled from 'styled-components'

const Log = () => <Log.Styled />

Log.Styled = styled.div`
  width: 0px;
  height: 100%;
`

namespace Log {
  export interface Props {}
}

export default Log
