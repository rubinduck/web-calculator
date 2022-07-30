class Enum {
    toString(){
        const properties = [];
        for (const propertyName of Object.keys(this)){
            properties.push(propertyName);
        }
        return `Enum [${properties.join(', ')}]`;
    }
}

const genEnum = (...elements) => {
    const enumObject = new Enum;
    for (const element of elements){
        enumObject[element] = Symbol(element);
    }
    return Object.freeze(enumObject);
}

export default genEnum;