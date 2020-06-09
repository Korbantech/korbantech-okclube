interface Associated {
  name: string
  logo: string
  description: string
  clubNdId?: number
  benefit: Associated.Benefit | number
}

namespace Associated {
  export interface Benefit {
    title: string
    discount: number
    description: string
    category: Benefit.Category | number
  }
  export namespace Benefit {
    export interface Category {
      name: string
    }
  }
}

export default Associated
