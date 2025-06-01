import React from 'react';

const About = () => {
  const features = [
    { title: 'Crop Planning', description: 'AI-powered crop recommendations' },
    { title: 'Disease Detection', description: 'Advanced image analysis for plant diseases' },
    { title: 'AI Assistant', description: '24/7 agricultural support and guidance' }
  ];

  const team = [
    { name: 'Dr. Smith', role: 'Agricultural Expert' },
    { name: 'Sarah Chen', role: 'AI Researcher' },
    { name: 'Mike Johnson', role: 'Software Engineer' }
  ];

  return (
    <div>
      <h1>About AgriAI</h1>
      
      <section>
        <h2>Our Mission</h2>
        <p>Revolutionizing agriculture through artificial intelligence and smart farming solutions.</p>
      </section>

      <section>
        <h2>Features</h2>
        <div>
          {features.map((feature, index) => (
            <div key={index}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Our Team</h2>
        <div>
          {team.map((member, index) => (
            <div key={index}>
              <h4>{member.name}</h4>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Contact</h2>
        <p>Email: contact@agriai.com</p>
        <p>Phone: +1 (555) 123-4567</p>
      </section>
    </div>
  );
};

export default About;
