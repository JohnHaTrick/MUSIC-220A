%% manipulate cmpc data into a something musical!
%

clear
close all

%% import and extract control data
load('SIMDATA_cmpc_obsAvoidance.mat');      % load cmpc data

u_n = optRecord.optVars.u(:,7:21);          % extract whats needed
u_c = optRecord.optVars.u_c(:,7:21);        %   toss remainder
% clear constants controlParams simParams vehicle world optRecord

% consider creating a curve fit to increase data density?

%% FFT parameters
period = constants.LONG_TS;                 % sampling period
samp_f = 1/period;                          % sampling frequency
samp_N = size(u_n,2);                       % number of samples
t_rel  = (0:samp_N-1)*period;               % relative time vector
f_dom  = samp_f*(0:(samp_N/2))/samp_N;      % frequency range

idx = 180; % idx of interest

figure();
subplot(2,1,1); hold on;                    % plot the raw signals
    plot(t_rel, u_n(idx,:));
    plot(t_rel, u_c(idx,:));
    xlabel('time');
    ylabel('steer cmd');

%% calculate FFT
FFT_n         = fft(u_n(idx,:)'); % just for idx for now
P2_n          = abs(FFT_n/samp_N);
P1_n          = P2_n(1:samp_N/2+1);
P1_n(2:end-1) = 2*P1_n(2:end-1);

FFT_c         = fft(u_c(idx,:)'); % just for idx for now
P2_c          = abs(FFT_c/samp_N);
P1_c          = P2_c(1:samp_N/2+1);
P1_c(2:end-1) = 2*P1_c(2:end-1);

f_dom_audible = f_dom*800;

subplot(2,1,2); hold on;
    plot(f_dom_audible,P1_n)
    plot(f_dom_audible,P1_c)
    xlabel('f [Hz]'); ylabel('amplitude');

%% save as datafile
csvwrite('frequencies.csv',      f_dom);
csvwrite('nominal_cmds.csv',     P1_n );
csvwrite('contingency_cmds.csv', P1_c );
