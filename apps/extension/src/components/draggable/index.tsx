import React from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'

interface PropTypes {
  children?: React.ReactNode
  // eslint-disable-next-line no-unused-vars
  onDragEnd: (result: DropResult) => void
}

const DraggableContainer = (props: PropTypes) => {
  return (
    <DragDropContext onDragEnd={props.onDragEnd}>
      <Droppable droppableId='droppable'>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {props.children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DraggableContainer
