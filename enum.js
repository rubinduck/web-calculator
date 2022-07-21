const Enum = (...elements) => {
    const enumaratedObject = {};
    for (const element of elements){
        enumaratedObject[element] = Symbol(element);
    }
    return Object.freeze(enumaratedObject);
}

export default Enum;