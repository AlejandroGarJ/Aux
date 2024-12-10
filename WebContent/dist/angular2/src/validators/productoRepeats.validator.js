export function productoRepeats(PARTNERS) {
    return (control) => {
        const value = control.value.ID_PROGRAMA;
        const isDuplicate = PARTNERS.controls.some((group) => {
            var _a;
            return (group !== control.parent &&
                ((_a = group.get("ID_PROGRAMA")) === null || _a === void 0 ? void 0 : _a.value.ID_PROGRAMA) === value);
        });
        if (isDuplicate) {
            return { duplicateIDPrograma: { value } };
        }
        return null;
    };
}
