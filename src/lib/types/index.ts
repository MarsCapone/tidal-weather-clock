type WithId<Base, IdKey extends string = 'id'> = Base & Record<IdKey, string>
