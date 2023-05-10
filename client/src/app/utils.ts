// https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
// https://reactgo.com/javascript-convert-string-literal/
export const interpolateTemplateString = (s: string, params: object): string => {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${s}\`;`)(...vals);
}
