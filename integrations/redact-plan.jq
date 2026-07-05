# Redacts Terraform plan values marked by before_sensitive, after_sensitive, or
# sensitive_values masks. Raw plans should stay local to CI; upload this output.

def redact($value; $mask):
  if $mask == true then
    "[REDACTED]"
  elif ($mask | type) == "object" and ($value | type) == "object" then
    reduce ($mask | keys_unsorted[]) as $key
      ($value; .[$key] = redact(.[$key]; $mask[$key]))
  elif ($mask | type) == "object" and ($value | type) == "array" then
    reduce ($mask | keys_unsorted[]) as $key
      ($value; .[($key | tonumber? // $key)] = redact(.[$key | tonumber? // $key]; $mask[$key]))
  elif ($mask | type) == "array" and ($value | type) == "array" then
    reduce range(0; ($mask | length)) as $index
      ($value; .[$index] = redact(.[$index]; $mask[$index]))
  else
    $value
  end;

def redact_output_value:
  if .sensitive == true and has("value") then
    .value = "[REDACTED]"
  else
    .
  end;

def redact_resource_instance:
  if has("values") and has("sensitive_values") then
    .values = redact(.values; .sensitive_values)
    | del(.sensitive_values)
  else
    .
  end;

def redact_module:
  (if has("resources") then .resources |= map(redact_resource_instance) else . end)
  | (if has("child_modules") then .child_modules |= map(redact_module) else . end);

def redact_values:
  (if has("root_module") then .root_module |= redact_module else . end)
  | (if has("outputs") then .outputs |= with_entries(.value |= redact_output_value) else . end);

def redact_change:
  .change |= (
    (if has("before") then .before = redact(.before; .before_sensitive) else . end)
    | (if has("after") then .after = redact(.after; .after_sensitive) else . end)
    | del(.before_sensitive, .after_sensitive)
  );

(if has("resource_changes") then .resource_changes |= map(redact_change) else . end)
| (if has("output_changes") then .output_changes |= map(redact_change) else . end)
| (if has("planned_values") then .planned_values |= redact_values else . end)
| (
  if (.prior_state? | type) == "object" and (.prior_state | has("values")) then
    .prior_state.values |= redact_values
  else
    .
  end
)
