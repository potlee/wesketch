Array::last = () ->
  this[@length - 1]

Array::flatten = () ->
  @reduce (a, b) ->
    a.concat(b)

