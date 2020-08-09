import React from 'react';
import Teacher from '../../Types/Teacher';
import whatsAppIcon from '../../assets/images/icons/whatsapp.svg';

import './styles.css';
import api from '../../pages/services/api';

interface TeacherItemProps {
    teacher: Teacher
}

const TeacherItem: React.FC<TeacherItemProps> = ({ teacher }) => {

    function createConnection() {
        api.post('connections', { user_id: teacher.id });
    }

    return (
        <article className="teacher-item">
            <header>
                <img src={teacher.avatar} alt={teacher.name} />
                <div>
                    <strong>{teacher.name}</strong>
                    <span>{teacher.subject}</span>
                </div>
            </header>
            <p>{teacher.bio}</p>
            <footer>
                <p>
                    Preço por hora
                             <strong>R$ {teacher.cost}</strong>
                </p>
                <a
                    target="_blank"
                    rel="noopener noreferrer" 
                    href={`https://wa.me/${teacher.whatsapp}`}
                    onClick={createConnection}>
                    <img src={whatsAppIcon} alt="Whatsapp" />
                            Entrar em contato
                        </a>
            </footer>
        </article>
    );
}

export default TeacherItem;