const locations = [
	'Адмиралтейский',
	'Василеостровский',
	'Выборгский',
	'Калининский',
	'Кировский',
	'Колпинский',
	'Комитет по культуре Санкт-Петербурга',
	'Красногвардейский',
	'Красносельский',
	'Кронштадтский',
	'Курортный',
	'Московский',
	'Невский',
	'Петроградский',
	'Петродворцовый',
	'Приморский',
	'Пушкинский',
	'Фрунзенский',
	'Центральный',
];

const types = [
	'Детские сады',
	'Образовательные учреждения',
	'Учреждения начального и среднего профессионального образования',
	'Учреждения дополнительного образования',
];

const subtypes = [
	'Дошкольные образовательные учреждения',
	'Образовательные учреждения дополнительного образования детей',
	'Образовательные учреждения высшего профессионального образования',
	'Образовательные учреждения для детей дошкольного и младшего школьного возраста',
	'Образовательные учреждения для детей, нуждающихся в психолого-педагогической и медико-социальной помощи',
	'Образовательные учреждения для детей-сирот и детей, оставшихся без попечения родителей',
	'Образовательные учреждения дополнительного профессионального образования',
	'Образовательные учреждения начального профессионального образования',
	'Образовательные учреждения среднего профессионального образования',
	'Общеобразовательные учреждения',
	'Общеобразовательные школы-интернаты',
	'Специальные (коррекционные) образовательные учреждения для обучающихся, воспитанников с отклонениями в развитии',
	'Специальные учебно-воспитательные учреждения для детей и подростков с девиантным поведением',
	'Суворовские военные, нахимовские военно-морские училища и кадетские (морские кадетские) корпуса',
];

const categories = ['Университет', 'Институт', 'Академия'];

export const orgLocationFromInd = (i) => locations[i];
export const orgLocationToInd = (str) => {
	return locations.findIndex((location) => location.includes(str));
};

export const orgTypeFromInd = (i) => types[i];
export const orgTypeToInd = (nameOrg) => {
	const orgTypeIndex = (str) => {
		return types.findIndex((type) => str.toLowerCase().includes(type.toLowerCase()));
	};

	if (nameOrg.toLowerCase().includes('дошкольное')) {
		return orgTypeIndex('Детские сады');
	} else if (nameOrg.toLowerCase().includes('общеобразовательн')) {
		return orgTypeIndex('Образовательные учреждения');
	} else if (nameOrg.toLowerCase().includes('профес')) {
		return orgTypeIndex('Учреждения начального и среднего профессионального образования');
	} else if (nameOrg.toLowerCase().includes('дополнительного')) {
		return orgTypeIndex('Учреждения дополнительного образования');
	}
	return orgTypeIndex('Образовательные учреждения');
};

export const orgSubtypeFromInd = (i) => subtypes[i];
export const orgSubtypeToInd = (str) => {
	return subtypes.findIndex((subtype) => subtype.includes(str));
};

export const orgCategoryFromInd = (i) => categories[i];
export const orgCategoryToInd = (str) => {
	return categories.findIndex((category) => category.includes(str));
};

export const enumLengths = () => {
	return {
		locations: locations.length,
		types: types.length,
		subtypes: subtypes.length,
		categories: categories.length,
	};
};
