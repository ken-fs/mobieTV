import { defineStore } from 'pinia'

// 定义教育阶段类型
export interface EducationStage {
  id: string
  name: string
  avatar: string
}

// 可用的教育阶段选项
export const educationStages: EducationStage[] = [
  { 
    id: 'preschool', 
    name: '学龄前', 
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA2NCA2NCIgaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjI2IiBmaWxsPSIjRkY5RkI1Ii8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjQiIGZpbGw9IiNGRkRERUEiLz48Y2lyY2xlIGN4PSIyNiIgY3k9IjI3IiByPSIyLjUiIGZpbGw9IiM1RjU5M0EiLz48Y2lyY2xlIGN4PSIzOCIgY3k9IjI3IiByPSIyLjUiIGZpbGw9IiM1RjU5M0EiLz48cGF0aCBkPSJtIDI1LDM2IGMgMCw0IDMsNyA3LDcgcyA3LC0zIDcsLTciIHN0cm9rZT0iIzVGNTkzQSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIxOCIgcj0iMTAiIGZpbGw9IiNEMDk5NDQiLz48L3N2Zz4=' 
  },
  { 
    id: 'primary', 
    name: '小学', 
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA2NCA2NCIgaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjI2IiBmaWxsPSIjODBERkZGIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjQiIGZpbGw9IiNGRkRERUEiLz48Y2lyY2xlIGN4PSIyNiIgY3k9IjI3IiByPSIyLjUiIGZpbGw9IiM1RjU5M0EiLz48Y2lyY2xlIGN4PSIzOCIgY3k9IjI3IiByPSIyLjUiIGZpbGw9IiM1RjU5M0EiLz48cGF0aCBkPSJtIDI1LDM2IGMgMCw0IDMsNyA3LDcgcyA3LC0zIDcsLTciIHN0cm9rZT0iIzVGNTkzQSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIxOCIgcj0iMTAiIGZpbGw9IiNEMDk5NDQiLz48L3N2Zz4=' 
  },
  { 
    id: 'middle', 
    name: '初中', 
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA2NCA2NCIgaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjI2IiBmaWxsPSIjRkZGRjgwIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjQiIGZpbGw9IiNGRkRERUEiLz48Y2lyY2xlIGN4PSIyNiIgY3k9IjI3IiByPSIyLjUiIGZpbGw9IiM1RjU5M0EiLz48Y2lyY2xlIGN4PSIzOCIgY3k9IjI3IiByPSIyLjUiIGZpbGw9IiM1RjU5M0EiLz48cGF0aCBkPSJtIDI1LDM2IGMgMCw0IDMsNyA3LDcgcyA3LC0zIDcsLTciIHN0cm9rZT0iIzVGNTkzQSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIxOCIgcj0iMTAiIGZpbGw9IiNEMDk5NDQiLz48L3N2Zz4=' 
  },
  { 
    id: 'high', 
    name: '高中', 
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA2NCA2NCIgaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjI2IiBmaWxsPSIjQjZGRkI2Ii8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjQiIGZpbGw9IiNGRkRERUEiLz48Y2lyY2xlIGN4PSIyNiIgY3k9IjI3IiByPSIyLjUiIGZpbGw9IiM1RjU5M0EiLz48Y2lyY2xlIGN4PSIzOCIgY3k9IjI3IiByPSIyLjUiIGZpbGw9IiM1RjU5M0EiLz48cGF0aCBkPSJtIDI1LDM2IGMgMCw0IDMsNyA3LDcgcyA3LC0zIDcsLTciIHN0cm9rZT0iIzVGNTkzQSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIxOCIgcj0iMTAiIGZpbGw9IiNEMDk5NDQiLz48cmVjdCB4PSIyOCIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjEyIiByeD0iMSIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==' 
  }
]

// 定义教育store
export const useEducationStore = defineStore('education', {
  state: () => ({
    selectedStageId: null as string | null
  }),
  
  getters: {
    // 获取选中的教育阶段名称
    selectedStageName: (state) => {
      if (!state.selectedStageId) return ''
      const stage = educationStages.find(s => s.id === state.selectedStageId)
      return stage?.name || ''
    },
    
    // 获取当前选中的教育阶段完整信息
    selectedStage: (state) => {
      if (!state.selectedStageId) return null
      return educationStages.find(s => s.id === state.selectedStageId) || null
    }
  },
  
  actions: {
    // 设置选中的教育阶段
    setSelectedStage(stageId: string) {
      this.selectedStageId = stageId
    },
    
    // 清除选中的教育阶段
    clearSelectedStage() {
      this.selectedStageId = null
    }
  }
})