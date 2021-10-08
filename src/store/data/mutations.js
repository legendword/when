export function change (state) {
    state.iteration += 1
}
export function categories (state, val) {
    state.categories = val
}
export function changeMonth (state, val) {
    state.currentMonth = val
}