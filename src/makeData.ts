import { faker } from '@faker-js/faker';

export type Person = {
    firstName: string
    lastName: string
    age: number
    visits: number
    progress: number
    status: 'relationship' | 'complicated' | 'single'
    subRows?: Person[]
}

const range = (len: number) => {
    const arr = []
    for (let i = 0; i < len; i++) {
        arr.push(i)
    }
    return arr
}

const newPerson = (): Person => {
    const f = faker as any;
    return {
        firstName: f.name.firstName(),
        lastName: f.name.lastName(),
        age: f.datatype.number(40),
        visits: f.datatype.number(1000),
        progress: f.datatype.number(100),
        status: f.helpers.shuffle([
            'relationship',
            'complicated',
            'single',
        ])[0]!,
    }
}

export function makeData(...lens: number[]) {
    const makeDataLevel = (depth = 0): Person[] => {
        const len = lens[depth]!
        return range(len).map((d): Person => {
            return {
                ...newPerson(),
                subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
            }
        })
    }

    return makeDataLevel()
}
