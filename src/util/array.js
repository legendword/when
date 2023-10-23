export const arrayMove = function (arr, old_index, new_index) {
  //moves item at old_index to new_index, part of code borrowed from StackOverflow: https://stackoverflow.com/a/5306832z
  if (old_index == new_index) return;
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  //return arr; //splice edits arr in place
};
export const arrayTransfer = function (old_arr, new_arr, old_index, new_index) {
  //moves item at old_index from old_arr to new_index at new_arr
  new_arr.splice(new_index, 0, old_arr.splice(old_index, 1)[0]);
};
