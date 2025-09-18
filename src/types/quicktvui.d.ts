/**
 * Type declarations for @quicktvui/quicktvui3
 */
declare module '@quicktvui/quicktvui3' {
  export interface QTListViewItem {
    id?: string | number
    title?: string
    subtitle?: string
    image?: string
    url?: string
    [key: string]: any
  }

  // Add other quicktvui types as needed
  export interface QTListView {
    items?: QTListViewItem[]
    [key: string]: any
  }

  // Export any other types that might be used
  export interface QTComponent {
    [key: string]: any
  }
}