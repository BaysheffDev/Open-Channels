def nameCheck(displayName, displayNames):
    for name in displayNames:
        if name == displayName:
            # name exists
            return False
    # name unique
    return True
