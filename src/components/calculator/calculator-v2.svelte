<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  /**
   * Based on the thebells1111 work from
   * https://codesandbox.io/s/svelte-calculator-9icog?file=/Components/Calculator/Calculator.svelte:0-6117
   */

  import Display from './display.svelte'

  export let value: number = 0
  export let displayFormat: Function
  const dispatch = createEventDispatcher()

  let totalArr: Array<any> = [value]
  let total: any = value
  let clearSet: boolean = false
  let hasChanged: boolean = false

  $: lastIsNumber =
    totalArr[totalArr.length - 1] && !isNaN(totalArr[totalArr.length - 1])
  $: if (total > Number.MAX_VALUE || total < -Number.MAX_VALUE) {
    total = 'err'
    totalArr = []
  }

  $: if (totalArr.length && total !== 'err' && total !== value) {
    dispatch('change', total)
  }

  function doTheMath(o?: any) {
    const operations: any = {
      '+': function (x: number, y: number): number {
        //@ts-ignore
        return (x + y).toPrecision(9) / 1
      },
      '-': function (x: number, y: number): number {
        //@ts-ignore
        return (x - y).toPrecision(9) / 1
      },
      '×': function (x: number, y: number): number {
        //@ts-ignore
        return (x * y).toPrecision(9) / 1
      },
      '%': function (x: number, y: number): number {
        //@ts-ignore
        return (x / y).toPrecision(9) / 1
      },
    }
    if (totalArr[totalArr.length - 3] === '=') {
      totalArr = [total, o]
    }

    let l = totalArr.length
    let prevOperand: any = totalArr[l - 3]
    if (l === 4) {
      total = operations[prevOperand](Number(totalArr[0]), Number(totalArr[2]))
    } else if (l > 5 && l % 2 === 0) {
      total = operations[prevOperand](Number(total), Number(totalArr[l - 2]))
    }
  }

  function handleNumber(value: any) {
    if (!hasChanged) {
      totalArr = []
    }
    hasChanged = true
    clearSet = false
    const targetText = value
    const lastElement = totalArr[totalArr.length - 1]
    if (lastIsNumber && lastElement) {
      if (lastElement.indexOf('.') === -1 && lastElement === '0') {
        totalArr[totalArr.length - 1] = targetText
      } else {
        totalArr[totalArr.length - 1] =
          totalArr[totalArr.length - 1] + targetText
      }
    } else {
      if (lastElement && lastElement === '=') {
        handleAC()
      }
      totalArr.push(targetText)
    }

    if (totalArr.length === 1) {
      total = parseFloat(totalArr[0])
    }

    totalArr = totalArr
  }

  function handleOperand(e: any) {
    const targetText = e
    if (totalArr.length && total !== 'err') {
      if (isNaN(totalArr[totalArr.length - 1])) {
        if (totalArr[totalArr.length - 1] === '=') {
          totalArr = [total, targetText]
        } else {
          totalArr[totalArr.length - 1] = targetText
        }
      } else {
        totalArr.push(targetText)
        doTheMath(targetText)
      }
    } else if (total === 'err') {
      total = 0
      totalArr = ['0', targetText]
    } else {
      totalArr.push(total)
      totalArr.push(targetText)
    }
    totalArr = totalArr
  }

  function handleEqual() {
    if (totalArr.length > 2) {
      if (totalArr[totalArr.length - 1] !== '=') {
        if (lastIsNumber) {
          totalArr.push('=')
        } else {
          totalArr[totalArr.length - 1] = '='
        }
      } else {
        //covers 2 =
        totalArr = [
          total,
          totalArr[totalArr.length - 3],
          totalArr[totalArr.length - 2],
          '=',
        ]
      }
      doTheMath()
      totalArr = totalArr
    }
  }

  function handleDecimal() {
    let last = totalArr[totalArr.length - 1]
    if (isNaN(last)) {
      if (last === '=') {
        handleAC()
      }
      totalArr.push('0.')
      if (total === 'err') {
        total = '0.'
      }
      totalArr = totalArr
    } else if (last.indexOf('.') === -1) {
      totalArr[totalArr.length - 1] = totalArr[totalArr.length - 1] + '.'
    }
  }

  function handleAC() {
    totalArr = []
    total = 0
  }

  function handleNegative() {
    if (lastIsNumber) {
      totalArr[totalArr.length - 1] = 0 - totalArr[totalArr.length - 1]
      if (totalArr.length === 1) {
        total = totalArr[totalArr.length - 1]
      }
    } else if (totalArr[totalArr.length - 1] === '=') {
      total = 0 - total
      totalArr = [total]
    }
  }

  function handleClear() {
    if (totalArr[totalArr.length - 1] === '=' || total === 'err') {
      clearSet = true
    }
    if (clearSet) {
      clearSet = false
      totalArr = []
      total = 0
    } else {
      clearSet = true
      if (lastIsNumber) {
        totalArr.pop()
        totalArr = totalArr
      }
    }
  }

  function handleKeypress(e: any) {
    let k = { target: { innerText: e.key } }
    if (e.key === '*') {
      k.target.innerText = '×'
    }

    if (!isNaN(e.key)) {
      handleNumber(k)
    } else if (['+', '-', '%', '*'].indexOf(e.key) > -1) {
      handleOperand(k)
    } else {
      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          handleEqual()
          break
        case 'Backspace':
          handleClear()
          break
        case 'Delete':
          handleAC()
          break
        case '.':
          handleDecimal()
          break
      }
    }
  }

  let buttons = [
    {
      value: 'ac',
      func: handleAC,
      id: 'ac',
    },
    {
      value: 'c',
      func: handleClear,
      id: 'clear',
    },
    {
      value: '+/-',
      func: handleNegative,
      id: 'neg',
    },
    {
      value: '÷',
      func: handleOperand,
      id: 'divide',
    },
    {
      value: '7',
      func: handleNumber,
      id: 'seven',
    },
    {
      value: '8',
      func: handleNumber,
      id: 'eight',
    },
    {
      value: '9',
      func: handleNumber,
      id: 'nine',
    },
    {
      value: '×',
      func: handleOperand,
      id: 'multiply',
    },
    {
      value: '4',
      func: handleNumber,
      id: 'four',
    },
    {
      value: '5',
      func: handleNumber,
      id: 'five',
    },
    {
      value: '6',
      func: handleNumber,
      id: 'six',
    },
    {
      value: '-',
      func: handleOperand,
      id: 'minus',
    },
    {
      value: '1',
      func: handleNumber,
      id: 'one',
    },
    {
      value: '2',
      func: handleNumber,
      id: 'two',
    },
    {
      value: '3',
      func: handleNumber,
      id: 'three',
    },
    {
      value: '+',
      func: handleOperand,
      id: 'add',
    },
    {
      value: '0',
      func: handleNumber,
      id: 'zero',
    },
    {
      value: '.',
      func: handleDecimal,
      id: 'decimal',
    },
    {
      value: '=',
      func: handleEqual,
      id: 'equal',
    },
  ]
</script>

<svelte:body on:keydown={handleKeypress} />

<Display {displayFormat} {total} {buttons} {totalArr} />
