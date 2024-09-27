export function upsertInMap<Key, Value>(map: Map<Key, Value>, key: Key, getValue: () => Value): Value {
  if (map.has(key)) {
    return map.get(key) ?? getValue();
  }

  const value = getValue();

  map.set(key, value);

  return value;
}
