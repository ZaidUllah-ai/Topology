import { useCallback } from "react";
import { Handle, Position } from "reactflow";

function CustomNode({ data, isConnectable }) {
  return (
    <div style={{ border: "0px solid red", backgroundColor: "transparent" }}>
      {data.location === "inner" ? (
        <Handle
          type="target"
          position={Position.Top}
          id={`${data.id}-up`}
          isConnectable={isConnectable}
        />
      ) : null}

      {data?.count > 1 ? (
        <Handle
          type="target"
          position={Position.Bottom}
          id={`${data.id}-down`}
          isConnectable={isConnectable}
        />
      ) : null}

      {data?.label}

      {data.location === "inner" ? (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      ) : null}
    </div>
  );
}

export default CustomNode;
