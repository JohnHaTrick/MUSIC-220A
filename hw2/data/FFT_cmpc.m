%% manipulate cmpc data into a something musical!
%

clear
close all

%% import and extract control data
load('SIMDATA_cmpc_obsAvoidance.mat');      % load cmpc data

u_n = optRecord.optVars.u;                  % extract steering commands
u_c = optRecord.optVars.u_c;

u_n = [u_n(:,2), u_n(:,7:21)];              % delete short timesteps
u_c = [u_c(:,2), u_c(:,7:21)];

% increase density of points: linear interpolation
interps = 2;
for j = 1:interps
    for i = length(u_n(1,:)) - 1 : -1 : 1
        u_n = [u_n(:,1:i), (u_n(:,i)+u_n(:,i+1))/2, u_n(:,i+1:end)];
        u_c = [u_c(:,1:i), (u_c(:,i)+u_c(:,i+1))/2, u_c(:,i+1:end)];
    end
end

% clear constants
clear controlParams simParams vehicle world optRecord

%% FFT parameters
period  = constants.LONG_TS / 2^interps;     % sampling period
samp_f  = 1/period;                          % sampling frequency
samp_N  = size(u_n,2);                       % number of samples
t_rel   = (0:samp_N-1)*period;               % relative time vector
up_samp = 5;                                % take this times as many samples
f_dom   = samp_f/samp_N ...
        * (0:1/2^(up_samp-1):(samp_N/2));    % frequency range

idx = 170; % idx of interest

figure();
subplot(2,1,1); hold on;                    % plot the raw signals
    plot(t_rel, u_n(idx,:));
    plot(t_rel, u_c(idx,:));
    xlabel('time');
    ylabel('steer cmd');

%% calculate FFT


FFT_n         = fft(u_n(idx,:)', ...         % just for idx for now
                    up_samp*length(u_n(idx,:)));
P2_n          = abs(FFT_n/samp_N);
P1_n          = P2_n(1:samp_N/2+1);
P1_n(2:end-1) = 2*P1_n(2:end-1);

FFT_c         = fft(u_c(idx,:)', ...
                    up_samp*length(u_c(idx,:)));
P2_c          = abs(FFT_c/samp_N);
P1_c          = P2_c(1:samp_N/2+1);
P1_c(2:end-1) = 2*P1_c(2:end-1);

f_dom_audible = f_dom*800;

subplot(2,1,2); hold on;
    plot(f_dom(1:length(P1_n)),P1_n)
    plot(f_dom(1:length(P1_n)),P1_c)
    xlabel('f [Hz]'); ylabel('amplitude');
%     xlim([0 1]);

%% save data
f_dom_json = jsonencode(f_dom);             % as json
P1_n_json  = jsonencode(P1_n);
P1_c_json  = jsonencode(P1_c);
save('frequencies.json',     'f_dom_json');
save('nominal_cmds.json',    'P1_n_json');
save('contingency_cmds.json','P1_c_json');

csvwrite('frequencies.csv',      f_dom);    % as csv
csvwrite('nominal_cmds.csv',     P1_n );
csvwrite('contingency_cmds.csv', P1_c );
