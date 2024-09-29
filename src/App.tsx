import React, { useState, useEffect } from 'react';
import './App.css';

const ModalWindow = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hourType, setHourType] = useState<string>('Академические');
    const [totalHours, setTotalHours] = useState<number>(3);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('07:45');
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
    const [breakTime, setBreakTime] = useState<string>('Без перерыва');
    const [hoursPerDay, setHoursPerDay] = useState<number>(1);
    const [startTime, setStartTime] = useState<string>('07:00');
    const [teacher, setTeacher] = useState<string>('');
    const [room, setRoom] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

    const getCurrentDate = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const currentDate = getCurrentDate();
        setStartDate(currentDate);
        setEndDate(currentDate);
    }, []);

    const calculateEndTime = (start: string, type: string, breakTime: string): string => {
        const [hours, minutes] = start.split(':').map(Number);
        const duration = type === 'Академические' ? 45 : 60;
        const breakDuration = breakTime === 'Без перерыва' ? 0 : parseInt(breakTime) || 0;
        const totalMinutes = hours * 60 + minutes + duration + breakDuration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;

        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const newEndTime = calculateEndTime(startTime, hourType, breakTime);
        setEndTime(newEndTime);
    }, [startTime, hourType, breakTime]);

    const calculateEndDate = (
        startDate: string,
        totalHours: number,
        daysOfWeek: string[],
        hoursPerDay: number
    ): string => {
        if (!daysOfWeek.length) return startDate; // Возвращаем стартовую дату, если дни недели не указаны

        // Преобразование дней недели в числа
        const dayNamesToNumbers: { [key: string]: number } = {
            'ПН': 1,
            'ВТ': 2,
            'СР': 3,
            'ЧТ': 4,
            'ПТ': 5,
            'СБ': 6,
            'ВС': 0
        };

        // Начальные значения
        const startDateObj = new Date(startDate);
        const totalDaysPerWeek = daysOfWeek.length;
        const hoursPerWeek = totalDaysPerWeek * hoursPerDay;

        if (hoursPerWeek === 0) return startDate; // Избегаем деления на 0

        const totalWeeksNeeded = Math.ceil(totalHours / hoursPerWeek);

        let remainingHours = totalHours;
        let currentDate = new Date(startDateObj);

        while (remainingHours > 0) {
            for (let i = 0; i < 7; i++) {
                const dayOfWeek = currentDate.getDay();

                if (daysOfWeek.map(day => dayNamesToNumbers[day]).includes(dayOfWeek)) {
                    remainingHours -= hoursPerDay;

                    if (remainingHours <= 0) break;
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        const endYear = currentDate.getFullYear();
        const endMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const endDay = currentDate.getDate().toString().padStart(2, '0');

        return `${endYear}-${endMonth}-${endDay}`;
    };


    useEffect(() => {
        const newEndDate = calculateEndDate(startDate, totalHours, daysOfWeek, hoursPerDay);
        setEndDate(newEndDate);
    }, [startDate, totalHours, daysOfWeek, hoursPerDay]);


    const handleDayToggle = (day: string) => {
        const newDaysOfWeek = daysOfWeek.includes(day)
            ? daysOfWeek.filter((d) => d !== day)
            : [...daysOfWeek, day];

        setDaysOfWeek(newDaysOfWeek);
    };

    const selectMultipleDays = (selectedDays: string[]) => {
        const newDaysOfWeek = [...daysOfWeek];

        selectedDays.forEach((day) => {
            if (newDaysOfWeek.includes(day)) {
                const index = newDaysOfWeek.indexOf(day);
                newDaysOfWeek.splice(index, 1);
            } else {
                newDaysOfWeek.push(day);
            }
        });

        setDaysOfWeek(newDaysOfWeek);
    };

    const handleGroupSelection = (group: string) => {
        if (group === 'ПН/СР/ПТ') {
            selectMultipleDays(['ПН', 'СР', 'ПТ']);
        } else if (group === 'ВТ/ЧТ') {
            selectMultipleDays(['ВТ', 'ЧТ']);
        }
    };

    const handleHoursPerDayChange = (value: number) => {
        setHoursPerDay(value);
    };

    const incrementHours = () => setTotalHours((prev) => prev + 1);
    const decrementHours = () => setTotalHours((prev) => (prev > 1 ? prev - 1 : 1));

    const validateForm = (): boolean => {
        const errors: { [key: string]: boolean } = {};
        if (!hourType) errors.hourType = true;
        if (!totalHours) errors.totalHours = true;
        if (!startDate) errors.startDate = true;
        if (!daysOfWeek.length) errors.daysOfWeek = true;
        if (!breakTime) errors.breakTime = true;
        if (!hoursPerDay) errors.hoursPerDay = true;
        if (!startTime) errors.startTime = true;
        if (!endTime) errors.endTime = true;

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setHourType('Академические');
        setTotalHours(3);
        const currentDate = getCurrentDate();
        setStartDate(currentDate);
        setDaysOfWeek([]);
        setBreakTime('Без перерыва');
        setHoursPerDay(1);
        setStartTime('07:00');
        setEndTime(calculateEndTime('07:00', 'Академические', breakTime));
        setTeacher('');
        setRoom('');
        setError(null);
        setFieldErrors({});
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        const newEndDate = calculateEndDate(startDate, totalHours, daysOfWeek, hoursPerDay);

        let breakDuration = 0;
        switch (breakTime) {
            case '5 минут':
                breakDuration = 5;
                break;
            case '10 минут':
                breakDuration = 10;
                break;
            case '15 минут':
                breakDuration = 15;
                break;
            case '20 минут':
                breakDuration = 20;
                break;
            default:
                breakDuration = 0;
        }

        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const totalEndMinutes = endHours * 60 + endMinutes + breakDuration;
        const finalEndTime = `${Math.floor(totalEndMinutes / 60) % 24}:${(totalEndMinutes % 60).toString().padStart(2, '0')}`;

        const scheduleData = {
            hourType,
            totalHours,
            startDate,
            endDate: newEndDate,
            daysOfWeek,
            breakTime,
            hoursPerDay,
            startTime,
            endTime: finalEndTime,
            teacher,
            room
        };

        console.log('Submitted schedule:', scheduleData);

        resetForm();
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="container">
                <button className="modal-btn" onClick={() => setIsModalOpen(true)}>
                    Открыть расписание
                </button>

                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 className="header">Редактирование расписания</h2>
                                <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="first-row">
                                    <div className="form-group">
                                        <select
                                            value={hourType}
                                            onChange={(e) => setHourType(e.target.value)}
                                            className={fieldErrors.hourType ? 'error-field' : ''}
                                        >
                                            <option value="Академические">Академические</option>
                                            <option value="Астрономические">Астрономические</option>
                                        </select>
                                    </div>

                                    <div className="form-group hours-control">

                                        <button type="button" className="dibuttons" onClick={decrementHours}>-</button>
                                        <input
                                            type="number"
                                            value={totalHours}
                                            onChange={(e) => setTotalHours(Number(e.target.value))}
                                            min="1"
                                            className={fieldErrors.totalHours ? 'error-field' : ''}
                                        />
                                        <div className="tag">Всего часов</div>
                                        <button type="button" className="dibuttons" onClick={incrementHours}>+</button>
                                    </div>

                                    <div className="form-group">
                                        <div className="date-time">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className={fieldErrors.startDate ? 'error-field' : ''}
                                            />
                                            <div className="till">до</div>
                                            <input
                                                type="date"
                                                value={endDate}
                                                readOnly
                                                className={fieldErrors.endDate ? 'error-field' : ''}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="weekday">
                                    <div className="group-buttons">
                                        <button type="button" className="pon"
                                                onClick={() => handleGroupSelection('ПН/СР/ПТ')}>
                                            ПН/СР/ПТ
                                        </button>
                                        <button type="button" className="vtor"
                                                onClick={() => handleGroupSelection('ВТ/ЧТ')}>
                                            ВТ/ЧТ
                                        </button>
                                    </div>

                                    <div className="weekdays">
                                        {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day) => (
                                            <button
                                                type="button"
                                                key={day}
                                                className={`${daysOfWeek.includes(day) ? 'active' : ''} ${fieldErrors.daysOfWeek ? 'error-field' : ''}`}
                                                onClick={() => handleDayToggle(day)}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="third-row">
                                    <div className="form-group">
                                        <select
                                            value={breakTime}
                                            onChange={(e) => setBreakTime(e.target.value)}
                                            className={fieldErrors.breakTime ? 'error-field' : ''}
                                        >
                                            <option value="Без перерыва">Без перерыва</option>
                                            <option value="5 минут">5 минут</option>
                                            <option value="10 минут">10 минут</option>
                                            <option value="15 минут">15 минут</option>
                                            <option value="20 минут">20 минут</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <button type="button" className="dibuttons"
                                                onClick={() => handleHoursPerDayChange(hoursPerDay - 1)}>-
                                        </button>
                                        <input
                                            type="number"
                                            value={hoursPerDay}
                                            onChange={(e) => handleHoursPerDayChange(Number(e.target.value))}
                                            min="1"
                                            className={fieldErrors.hoursPerDay ? 'error-field' : ''}
                                        />
                                        <div className="tag">Часов в день</div>
                                        <button type="button" className="dibuttons"
                                                onClick={() => handleHoursPerDayChange(hoursPerDay + 1)}>+
                                        </button>
                                    </div>

                                    <div className="form-group">
                                        <div className="date-time">
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className={fieldErrors.startTime ? 'error-field' : ''}
                                            />
                                            <div className="till">до</div>
                                            <input
                                                type="time"
                                                readOnly
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className={fieldErrors.endTime ? 'error-field' : ''}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="fourth-row">
                                    <div className="form-group teacher-input">
                                        <select
                                            value={teacher}
                                            onChange={(e) => setTeacher(e.target.value)}
                                            className={fieldErrors.teacher ? 'error-field' : ''}
                                        >
                                            <option value="">Выберите преподавателя на это время</option>
                                            <option value="Преподаватель 1">Преподаватель 1</option>
                                            <option value="Преподаватель 2">Преподаватель 2</option>
                                        </select>
                                    </div>

                                    <div className="form-group room-input">
                                        <select
                                            value={room}
                                            onChange={(e) => setRoom(e.target.value)}
                                            className={fieldErrors.room ? 'error-field' : ''}
                                        >
                                            <option value="">Аудитория</option>
                                            <option value="Аудитория 1">Аудитория 1</option>
                                            <option value="Аудитория 2">Аудитория 2</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="anouncements">Выбор преподователя и аудитории не обязателен</div>

                                <div className="form-row">
                                    <button onClick={() => setIsModalOpen(false)}>
                                        Отмена
                                    </button>
                                    <button type="submit">Добавить расписание</button>
                                    {error && <p className="error">{error}</p>}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ModalWindow;
