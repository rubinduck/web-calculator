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
    const enumaratedObject = new Enum;
    for (const element of elements){
        enumaratedObject[element] = Symbol(element);
    }
    return Object.freeze(enumaratedObject);
}

export default genEnum;