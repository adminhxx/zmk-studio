import { useEffect, useMemo, useState, useRef } from "react";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import "./virtual-keyboard.css";

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
    return behaviors.find(b => b.displayName == 'Key Press')?.id || 4;
  }, [behaviors]);
  const bluetoothBehaviorId = useMemo(() => {
    return behaviors.find(b => b.displayName == 'Bluetooth')?.id || 5;
  }, [behaviors]);
  const [param1, setParam1] = useState<number | undefined>(binding.param1);
  const [param2, setParam2] = useState<number | undefined>(binding.param2);
  const [layoutName] = useState('default');
  const [activeTab, setActiveTab] = useState('main'); // 添加标签页状态
  const mainKeyboard = useRef<any>(null);

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

  // 按键映射表
  const keyCodeMap: Record<string, number[]> = useMemo(() => ({
  // 字母键
  "q": [458772], "w": [458778], "e": [458760], "r": [458773], "t": [458775], "y": [458780], "u": [458776], "i": [458764], "o": [458770], "p": [458771],
  "a": [458756], "s": [458774], "d": [458759], "f": [458761], "g": [458762], "h": [458763], "j": [458765], "k": [458766], "l": [458767],
  "z": [458781], "x": [458779], "c": [458758], "v": [458777], "b": [458757], "n": [458769], "m": [458768],
  // 数字键
  "1": [458782], "2": [458783], "3": [458784], "4": [458785], "5": [458786], "6": [458787], "7": [458788], "8": [458789], "9": [458790], "0": [458791],
  // F键区
  "F1": [458810], "F2": [458811], "F3": [458812], "F4": [458813], "F5": [458814], "F6": [458815], 
  "F7": [458816], "F8": [458817], "F9": [458818], "F10": [458819], "F11": [458820], "F12": [458821],
  // 字符
  "`": [458805],
  "-": [458797], "=": [458798], 
  "[": [458799], "]": [458800], "\\": [458801],
  ";": [458803], "'": [458804], ",": [458806], ".": [458807], "/": [458808],
  // 功能键
  "{escape}": [458793], "{backspace}": [458794], "{tab}": [458795], "{enter}": [458792], "{capslock}": [458809],
  "{shiftleft}": [458977], "{shiftright}": [458981], "{controlleft}": [458976], "{controlright}": [458980],
  "{altleft}": [458978], "{altright}": [458982], "{metaleft}": [458979], "{metaright}": [458983], "{space}": [458796],
  // 控制键区
  "{prtscr}": [458822], "{scrolllock}": [458823], "{pause}": [458824], "{insert}": [458825], "{home}": [458826],
  "{pageup}": [458827], "{delete}": [458828], "{end}": [458829], "{pagedown}": [458830],
  // 方向键
  "{arrowup}": [458834], "{arrowleft}": [458832], "{arrowdown}": [458833], "{arrowright}": [458831],
  // 数字小键盘
  "{numpad7}": [458847], "{numpad8}": [458848], "{numpad9}": [458849], "{numpad4}": [458844], "{numpad5}": [458845],
  "{numpad6}": [458846], "{numpad1}": [458841], "{numpad2}": [458842], "{numpad3}": [458843], "{numpad0}": [458850],
  "{numpaddecimal}": [458851], "{numpaddivide}": [458836], "{numpadmultiply}": [458837], "{numpadsubtract}": [458838],
  "{numpadadd}": [458839], "{numpadenter}": [458840], "{numlock}": [458883],
   // 安卓特殊按键
  "{androidvolup}": [458880], "{androidvoldown}": [458881], "{androidlock}": [786846], 
  "{androidback}": [786980], "{androidhome}": [786979], "{androidmenu}": [786496],
  // 蓝牙按键
  "{clearallprofiles}": [4], "{nextprofile}": [1], "{prevprofile}": [2],
  "{select0}": [3,0], "{select1}": [3,1],
}), []);

  // 获取当前选中的按键名称
  const currentKeyName = useMemo(() => {
    if ((behaviorId === keyPressBehaviorId || behaviorId === bluetoothBehaviorId) && param1 !== undefined) {
      // 查找匹配param1和param2的按键
      for (const [keyName, keyCodes] of Object.entries(keyCodeMap)) {
        if (keyCodes[0] === param1) {
          // 如果keyCodeMap中有第二个参数
          if (keyCodes.length > 1) {
            // 检查param2是否匹配
            if (keyCodes[1] === param2) {
              return keyName;
            }
          } else {
            if (param2 === undefined || param2 === 0) {
              return keyName;
            }
          }
        }
      }
    }
    return null;
  }, [behaviorId, bluetoothBehaviorId, keyPressBehaviorId, param1, param2, keyCodeMap]);

  // 高亮样式配置
  const buttonTheme = useMemo(() => {
    if (!currentKeyName) return [];
    
    return [
      {
        class: "hg-highlight",
        buttons: currentKeyName
      }
    ];
  }, [currentKeyName]);

  // 通用键盘配置
  const commonKeyboardOptions = useMemo(() => ({
    physicalKeyboardHighlight: true,
    syncInstanceInputs: true,
    mergeDisplay: true,
    theme: "hg-theme-default virtual-keyboard",
    buttonTheme: buttonTheme
  }), [buttonTheme]);

  // 主键盘配置
  const mainKeyboardOptions = useMemo(() => ({
    ...commonKeyboardOptions,
    layoutName,
    layout: {
      default: [
        "{escape} F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12",
        "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
        "{tab} q w e r t y u i o p [ ] \\",
        "{capslock} a s d f g h j k l ; ' {enter}",
        "{shiftleft} z x c v b n m , . / {shiftright}",
        "{controlleft} {altleft} {metaleft} {space} {controlright} {altright}"
      ]
    },
    display: {
      "{escape}": "Esc",
      "{tab}": "Tab ⇥",
      "{backspace}": "⌫",
      "{enter}": "Enter",
      "{capslock}": "Caps ⇪",
      "{shiftleft}": "Shift ⇧",
      "{shiftright}": "Shift ⇧",
      "{controlleft}": "Ctrl",
      "{controlright}": "Ctrl",
      "{altleft}": "Alt",
      "{altright}": "Alt",
      "{metaleft}": "Win",
      "{metaright}": "Win",
    },
    onKeyPress: handleKeyPress
  }), [layoutName, handleKeyPress, commonKeyboardOptions]);

  // 控制键区配置
  const controlPadOptions = useMemo(() => ({
    ...commonKeyboardOptions,
    layout: {
      default: [
        "{prtscr} {scrolllock} {pause}",
        "{insert} {home} {pageup}",
        "{delete} {end} {pagedown}"
      ]
    },
    display: {
      "{prtscr}": "PS",
      "{scrolllock}": "SL",
      "{pause}": "P",
      "{insert}": "Ins",
      "{home}": "HM",
      "{pageup}": "PU",
      "{delete}": "Del",
      "{end}": "End",
      "{pagedown}": "PD"
    },
    onKeyPress: handleKeyPress
  }), [commonKeyboardOptions, handleKeyPress]);

  // 方向键区配置
  const arrowsOptions = useMemo(() => ({
    ...commonKeyboardOptions,
    layout: {
      default: ["{arrowup}", "{arrowleft} {arrowdown} {arrowright}"]
    },
    display: {
      "{arrowup}": "↑",
      "{arrowleft}": "←",
      "{arrowdown}": "↓",
      "{arrowright}": "→"
    },
    onKeyPress: handleKeyPress
  }), [commonKeyboardOptions, handleKeyPress]);

  // 数字键区配置
  const numpadOptions = useMemo(() => ({
    ...commonKeyboardOptions,
    layout: {
      default: [
        "{numlock} {numpaddivide} {numpadmultiply}",
        "{numpad7} {numpad8} {numpad9}",
        "{numpad4} {numpad5} {numpad6}",
        "{numpad1} {numpad2} {numpad3}",
        "{numpad0} {numpaddecimal}"
      ]
    },
    display: {
      "{numlock}": "Num\nLock",
      "{numpaddivide}": "/",
      "{numpadmultiply}": "*",
      "{numpad7}": "7",
      "{numpad8}": "8",
      "{numpad9}": "9",
      "{numpad4}": "4",
      "{numpad5}": "5",
      "{numpad6}": "6",
      "{numpad1}": "1",
      "{numpad2}": "2",
      "{numpad3}": "3",
      "{numpad0}": "0",
      "{numpaddecimal}": "."
    },
    onKeyPress: handleKeyPress
  }), [commonKeyboardOptions, handleKeyPress]);

  // 数字键区右侧配置
  const numpadEndOptions = useMemo(() => ({
    ...commonKeyboardOptions,
    layout: {
      default: ["{numpadsubtract}", "{numpadadd}", "{numpadenter}"]
    },
    display: {
      "{numpadsubtract}": "-",
      "{numpadadd}": "+",
      "{numpadenter}": "↲"
    },
    onKeyPress: handleKeyPress
  }), [commonKeyboardOptions, handleKeyPress]);

  // 安卓特殊按键配置
  const androidSpecialOptions = useMemo(() => ({
    ...commonKeyboardOptions,
    layout: {
      default: ["{androidvolup} {androidvoldown} {androidlock} {androidback} {androidhome}"]
    },display: {
      "{androidvolup}": "Vol+",
      "{androidvoldown}": "Vol-",
      "{androidlock}": "锁屏键",
      "{androidback}": "返回键",
      "{androidhome}": "Home键"
    },
    onKeyPress: handleKeyPress
  }), [commonKeyboardOptions, handleKeyPress]);

  // 蓝牙按键配置
  const bluetoothOptions = useMemo(() => ({
    ...commonKeyboardOptions,
    layout: {
      default: ["{clearallprofiles} {nextprofile} {prevprofile} {select0} {select1}"]
    },
    display: {
      "{clearallprofiles}": "重置蓝牙",
      "{nextprofile}": "下一配置",
      "{prevprofile}": "上一配置",
      "{select0}": "切至配置0",
      "{select1}": "切至配置1",
    },
    onKeyPress: handleBluetoothKeyPress,
    baseClass: "simple-keyboard-bluetooth"
  }), [commonKeyboardOptions, handleBluetoothKeyPress]);

  // 处理按键事件
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handleKeyPress(button: string) {
    const keyCodes = keyCodeMap[button];
    if (keyCodes && keyPressBehaviorId) {
      setBehaviorId(keyPressBehaviorId);
      setParam1(keyCodes[0]);
      setParam2(undefined);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handleBluetoothKeyPress(button: string) {
    const keyCodes = keyCodeMap[button];
    if (keyCodes && bluetoothBehaviorId) {
      setBehaviorId(bluetoothBehaviorId);
      setParam1(keyCodes[0]);
       // 如果有第二个参数，则设置param2
      if (keyCodes.length > 1) {
        setParam2(keyCodes[1]);
      } else {
        setParam2(undefined);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2" id="MainKeyboard">
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
        {/* 当前选中按键显示 */}
        {/* {currentKeyName && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <span className="text-sm font-medium text-blue-700">
              Selected Key: {currentKeyName.replace(/[{}]/g, '')} (HID: {param1})
            </span>
          </div>
        )} */}
        
        {/* 标签页导航 */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'main' ? 'active' : ''}`}
            onClick={() => setActiveTab('main')}
          >
            Keyboard
          </button>
          <button
            className={`tab-button ${activeTab === 'special' ? 'active' : ''}`}
            onClick={() => setActiveTab('special')}
          >
            Special
          </button>
        </div>

        {/* 标签页内容 */}
        <div className="tab-content">
          {/* 完整键盘标签页 - 包含主键盘、控制键区和数字键盘 */}
          {activeTab === 'main' && (
            <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              {/* 主键盘区域 */}
              <div className="flex flex-col gap-2">
                <div className="main-keyboard flex-grow">
                  <Keyboard
                    baseClass={"simple-keyboard-main"}
                    ref={mainKeyboard}
                    {...mainKeyboardOptions}
                  />
                </div>
              </div>

              {/* 右侧辅助键盘区域 */}
              <div className="flex flex-col gap-2">
                  {/* 控制键区和方向键区 */}
                  <div className="control-arrows-section flex flex-col gap-2">
                    <div className="control-pad">
                      <Keyboard baseClass={"simple-keyboard-control"}
                      {...controlPadOptions} />
                    </div>
                    <div className="arrows-pad">
                      <Keyboard baseClass={"simple-keyboard-arrows"}
                      {...arrowsOptions} />
                    </div>
                  </div>
              </div>
              <div className="flex flex-col gap-2">
                  {/* 数字小键盘区域 */}
                  <div className="numpad-section flex-grow">
                    <div className="numpad-main">
                      <Keyboard baseClass={"simple-keyboard-numpad"}
                       {...numpadOptions} />
                    </div>
                    <div className="numpad-end">
                      <Keyboard baseClass={"simple-keyboard-numpadEnd"}
                       {...numpadEndOptions} />
                    </div>
                  </div>
              </div>
            </div>
            </div>
          )}

          {/* 特殊按键标签页 */}
          {activeTab === 'special' && (
            <>
            <span className="tab-title"> Android Common Keys</span>
            <div className="flex flex-col gap-4">
              <div className="android-special-pad">
                <Keyboard {...androidSpecialOptions} />
              </div>
            </div>
            <span className="tab-title"> Bluetooth Keys</span>
            <div className="flex flex-col gap-4">
              <div className="bluetooth-pad">
                <Keyboard {...bluetoothOptions} />
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};