import { useEffect, useMemo, useState } from "react";

import {
  GetBehaviorDetailsResponse,
  BehaviorBindingParametersSet,
} from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { BehaviorBinding } from "@zmkfirmware/zmk-studio-ts-client/keymap";
import { BehaviorParametersPicker } from "./BehaviorParametersPicker";
import { validateValue } from "./parameters";

export interface BehaviorBindingPickerProps {
  binding: BehaviorBinding;
  behaviors: GetBehaviorDetailsResponse[];
  layers: { id: number; name: string }[];
  onBindingChanged: (binding: BehaviorBinding) => void;
}

function validateBinding(
  metadata: BehaviorBindingParametersSet[],
  layerIds: number[],
  param1?: number,
  param2?: number
): boolean {
  if (
    (param1 === undefined || param1 === 0) &&
    metadata.every((s) => !s.param1 || s.param1.length === 0)
  ) {
    return true;
  }

  let matchingSet = metadata.find((s) =>
    validateValue(layerIds, param1, s.param1)
  );

  if (!matchingSet) {
    return false;
  }

  return validateValue(layerIds, param2, matchingSet.param2);
}

export const BehaviorBindingPicker = ({
  binding,
  layers,
  behaviors,
  onBindingChanged,
}: BehaviorBindingPickerProps) => {
  const [behaviorId, setBehaviorId] = useState(binding.behaviorId);
  const keyPressBehaviorId = useMemo(() => {
    // 查找displayName包含"按键"或"Key"的行为ID
    return behaviors.find(b => 
      b.displayName == 'Key Press'
    )?.id || 4; // 默认使用4
  }, [behaviors]);
  const [param1, setParam1] = useState<number | undefined>(binding.param1);
  const [param2, setParam2] = useState<number | undefined>(binding.param2);

  const metadata = useMemo(
    () => behaviors.find((b) => b.id == behaviorId)?.metadata,
    [behaviorId, behaviors]
  );

  const sortedBehaviors = useMemo(
    () => behaviors.sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [behaviors]
  );

  useEffect(() => {
    if (
      binding.behaviorId === behaviorId &&
      binding.param1 === param1 &&
      binding.param2 === param2
    ) {
      return;
    }

    if (!metadata) {
      console.error(
        "Can't find metadata for the selected behaviorId",
        behaviorId
      );
      return;
    }

    if (
      validateBinding(
        metadata,
        layers.map(({ id }) => id),
        param1,
        param2
      )
    ) {
      onBindingChanged({
        behaviorId,
        param1: param1 || 0,
        param2: param2 || 0,
      });
    }
  }, [behaviorId, param1, param2]);

  useEffect(() => {
    setBehaviorId(binding.behaviorId);
    setParam1(binding.param1);
    setParam2(binding.param2);
  }, [binding]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label>按键行为: </label>
        <select
          value={behaviorId}
          className="h-8 rounded"
          onChange={(e) => {
            setBehaviorId(parseInt(e.target.value));
            setParam1(0);
            setParam2(0);
          }}
        >
          {sortedBehaviors.map((b) => (
            <option key={b.id} value={b.id}>
              {b.displayName}
            </option>
          ))}
        </select>
      </div>
      {metadata && (
        <BehaviorParametersPicker
          metadata={metadata}
          param1={param1}
          param2={param2}
          layers={layers}
          onParam1Changed={setParam1}
          onParam2Changed={setParam2}
        />
      )}
      <div>
        <label>常用按键: </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { name: "安卓音量+", behaviorId: keyPressBehaviorId, param1: 458880 },
            { name: "安卓音量-", behaviorId: keyPressBehaviorId, param1: 458881 },
            { name: "↑", behaviorId: keyPressBehaviorId, param1: 458834 },
            { name: "↓", behaviorId: keyPressBehaviorId, param1: 458833 },
            { name: "←", behaviorId: keyPressBehaviorId, param1: 458832 },
            { name: "→", behaviorId: keyPressBehaviorId, param1: 458831 },
            { name: "空格键", behaviorId: keyPressBehaviorId, param1: 458796 },
            { name: "回车", behaviorId: keyPressBehaviorId, param1: 458792 },
            { name: "退格", behaviorId: keyPressBehaviorId, param1: 458794 },
            { name: "Del", behaviorId: keyPressBehaviorId, param1: 458828 },
            { name: "Tab", behaviorId: keyPressBehaviorId, param1: 458795 },
            { name: "ESC", behaviorId: keyPressBehaviorId, param1: 458793 },
          ].map((key, index) => (
            <button
              key={index}
              className="px-3 py-1 border rounded bg-white"
              onClick={() => {
                setBehaviorId(key.behaviorId);
                setParam1(key.param1);
                setParam2(undefined);
              }}
            >
              {key.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};